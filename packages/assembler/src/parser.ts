import { charToDecimal } from "@vonsim/common/ascii";
import { Position } from "@vonsim/common/position";

import { AssemblerError } from "./error";
import type { Token, TokenType } from "./lexer/tokens";
import { NumberExpression } from "./number-expression";
import {
  createDataDirectiveStatement,
  createInstructionStatement,
  DataDirectiveStatement,
  DataDirectiveValue,
  DirectAddressOperand,
  EndStatement,
  IndirectAddressOperand,
  InstructionStatement,
  NumberExpressionDirectiveValue,
  NumberExpressionOperand,
  Operand,
  OriginChangeStatement,
  RegisterOperand,
  Statement,
  StringDirectiveValue,
  UnassignedDirectiveValue,
} from "./statements";
import { DATA_DIRECTIVES, INSTRUCTIONS, Register, REGISTERS } from "./types";

/**
 * The Parser
 *
 * Is responsible for taking a list of tokens (@see {@link Scanner}) and turning it into a
 * list of statements.
 *
 * It is a class because it maintains state as it parses the tokens, although it
 * could be refactored to be pure functions.
 *
 * This parser parses each line individually, which can be
 * - an origin change,
 * - an end statement,
 * - a data directive,
 * - or an instruction.
 *
 * @see {@link Statement}.
 *
 * The last two can have multiple operands separated by commas. Inside each operand,
 * there can be a number expression, which is a sequence of numbers and operators
 * that can be evaluated at assemble time.
 *
 * @see {@link NumberExpression}.
 *
 * The number expression parser is a recursive descent parser, which means that
 * it uses a set of functions to parse the tokens. Each function is responsible
 * for parsing a specific type of statement, and it calls other functions to parse
 * sub-parts of the statement.
 *
 * The parser is also responsible for validating the syntax of the source code.
 * For example, it will throw an error if it encounters a token that it doesn't
 * expect. More extensive validation is done later (see the index.ts).
 *
 * ---
 * This class is: MUTABLE
 */
export class Parser {
  /**
   * The tokens that the parser is currently parsing.
   */
  private tokens: Token[];

  /**
   * Index of the current token.
   */
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Statement[] {
    this.current = 0;
    const statements: Statement[] = [];

    while (!this.isAtEnd()) {
      if (this.match("EOL")) continue;

      statements.push(this.statement());
    }

    return statements;
  }

  private statement(): Statement {
    const statement =
      this.originChangeStatement() ??
      this.endStatement() ??
      this.dataDirectiveStatement() ??
      this.instructionStatement();

    if (!statement) {
      const token = this.peek();
      throw new AssemblerError("parser.expected-instruction", token).at(token);
    }

    return statement;
  }

  private originChangeStatement(): OriginChangeStatement | null {
    const token = this.match("ORG");
    if (!token) return null;

    const addressToken = this.consume(
      "NUMBER",
      new AssemblerError("parser.expected-address-after-org"),
    );
    const address = this.parseNumber(addressToken);

    this.endOfStatement();
    return new OriginChangeStatement(
      address,
      Position.merge(token.position, addressToken.position),
    );
  }

  private endStatement(): EndStatement | null {
    const token = this.match("END");
    if (!token) return null;

    while (!this.isAtEnd()) {
      if (this.match("EOL")) continue;

      throw new AssemblerError("end-must-be-the-last-statement").at(token);
    }

    return new EndStatement(token.position);
  }

  private dataDirectiveStatement(): DataDirectiveStatement | null {
    const labelToken = this.match("IDENTIFIER");
    const directiveToken = this.match(...DATA_DIRECTIVES);

    // Note: the code above will consume the label token if it exists, so it
    // handles the case where there is a label but no directive and vice versa.

    if (labelToken && !directiveToken) {
      throw new AssemblerError("parser.unexpected-identifier").at(labelToken);
    }

    if (!directiveToken) return null;

    // Labels always uppercase
    const label = labelToken?.lexeme.toUpperCase() || null;

    // There must be at least one value
    const values: DataDirectiveValue[] = [this.dataDirectiveValue()];

    while (this.match("COMMA")) values.push(this.dataDirectiveValue());

    this.endOfStatement();
    return createDataDirectiveStatement(directiveToken, values, label);
  }

  private dataDirectiveValue(): DataDirectiveValue {
    if (this.match("STRING")) {
      const stringToken = this.previous();
      return new StringDirectiveValue(this.parseString(stringToken), stringToken.position);
    }

    if (this.match("QUESTION_MARK")) {
      const questionMarkToken = this.previous();
      return new UnassignedDirectiveValue(questionMarkToken.position);
    }

    return new NumberExpressionDirectiveValue(this.numberExpression());
  }

  private instructionStatement(): InstructionStatement | null {
    const labelToken = this.match("LABEL");

    while (this.match("EOL")) continue; // Skip empty lines between labels and instructions

    const instructionToken = this.match(...INSTRUCTIONS);

    // Note: the code above will consume the label token if it exists, so it
    // handles the case where there is a label but no directive and vice versa.

    if (labelToken && !instructionToken) {
      const next = this.peek();
      throw new AssemblerError("parser.expected-instruction-after-label", next).at(next);
    }

    if (!instructionToken) return null;

    // Label is the lexeme without the colon. Always uppercase
    const label = labelToken?.lexeme.toUpperCase().slice(0, -1) || null;

    // Check for zeroary instructions
    if (this.isAtEndOfStatement()) {
      return createInstructionStatement(instructionToken, [], label);
    }

    const operands: Operand[] = [this.instructionOperand()];

    while (this.match("COMMA")) operands.push(this.instructionOperand());

    this.endOfStatement();
    return createInstructionStatement(instructionToken, operands, label);
  }

  private instructionOperand(): Operand {
    // Could be a register
    if (this.match(...REGISTERS)) {
      const registerToken = this.previous() as Token & { type: Register };
      return new RegisterOperand(registerToken);
    }

    // Could start with BYTE PTR or WORD PTR
    const sizeToken = this.match("BYTE", "WORD");
    if (sizeToken) {
      this.consume(
        "PTR",
        new AssemblerError("parser.expected-literal-after-literal", "PTR", this.previous().type),
      );
    }

    // Could be a indirect or direct address
    if (this.match("LEFT_BRACKET")) {
      const start = this.previous();

      if (this.check(...REGISTERS)) {
        this.consume("BX", new AssemblerError("parser.indirect-addressing-must-be-bx"));
        const offset = this.check("RIGHT_BRACKET") ? null : this.numberExpression();
        const end = this.consume(
          "RIGHT_BRACKET",
          new AssemblerError("parser.expected-literal-after-literal", "]", "BX"),
        );

        return new IndirectAddressOperand(
          sizeToken?.type,
          Position.merge(sizeToken?.position, start.position, end.position),
          offset,
        );
      } else {
        const expression = this.numberExpression();
        const end = this.consume(
          "RIGHT_BRACKET",
          new AssemblerError("parser.expected-literal-after-expression", "]"),
        );

        return new DirectAddressOperand(
          expression,
          sizeToken?.type,
          Position.merge(sizeToken?.position, start.position, end.position),
        );
      }
    } else if (sizeToken) {
      // Found BYTE PTR or WORD PTR but no left bracket
      throw new AssemblerError("parser.expected-literal-after-literal", "[", "PTR");
    }

    // Could be a label or a literal
    return new NumberExpressionOperand(this.numberExpression());
  }

  // #=========================================================================#
  // # Helpers                                                                 #
  // #=========================================================================#

  private advance() {
    return this.tokens[this.current++];
  }

  private check(...types: TokenType[]) {
    if (this.isAtEnd()) return false;

    for (const type of types) {
      if (this.peek().type === type) return true;
    }

    return false;
  }

  private consume<T extends TokenType>(
    type: T | T[],
    error?: AssemblerError<any>,
  ): Token & { type: T } {
    if (!Array.isArray(type)) type = [type];

    const token = this.match(...type);
    if (token) return token;

    error ||= new AssemblerError("parser.expected-type", type.join(","), this.peek().type);
    throw error.at(this.peek());
  }

  private endOfStatement() {
    if (this.isAtEnd()) return;
    if (this.check("EOL")) return this.advance();

    throw new AssemblerError("parser.expected-eos").at(this.peek());
  }

  private isAtEnd() {
    return this.peek().type === "EOF";
  }

  private isAtEndOfStatement() {
    return this.check("EOL") || this.isAtEnd();
  }

  private match<T extends TokenType>(...types: T[]): (Token & { type: T }) | null {
    if (this.check(...types)) return this.advance() as Token & { type: T };
    else return null;
  }

  private parseNumber(t: Token) {
    const raw = t.lexeme.replace(/_/g, ""); // Allow underscores in numbers for readability
    if (raw.at(-1) === "h" || raw.at(-1) === "H") {
      return parseInt(raw.slice(0, -1), 16);
    } else if (raw.at(-1) === "b" || raw.at(-1) === "B") {
      return parseInt(raw.slice(0, -1), 2);
    } else {
      return parseInt(raw, 10);
    }
  }

  private parseString(t: Token) {
    return t.lexeme.slice(1, -1);
  }

  private peek() {
    return this.tokens[this.current];
  }

  private previous() {
    return this.tokens[this.current - 1];
  }

  // #=========================================================================#
  // # Parse number expression (NE)                                            #
  // #=========================================================================#

  private primaryNE(): NumberExpression {
    if (this.match("NUMBER")) {
      const numberToken = this.previous();
      const value = this.parseNumber(numberToken);
      return NumberExpression.numberLiteral(value, numberToken.position);
    }

    if (this.match("CHARACTER")) {
      const characterToken = this.previous();
      const value = charToDecimal(characterToken.lexeme.slice(1, -1))!; // Checked by the lexer
      return NumberExpression.numberLiteral(value, characterToken.position);
    }

    if (this.match("LEFT_PAREN")) {
      const expression = this.numberExpression();
      this.consume("RIGHT_PAREN", new AssemblerError("parser.unclosed-parenthesis"));
      return expression;
    }

    const offsetToken = this.match("OFFSET");
    const identifierToken = this.match("IDENTIFIER");

    if (offsetToken && !identifierToken) {
      throw new AssemblerError("parser.expected-label-after-offset").at(this.peek());
    }

    if (!identifierToken) {
      // Nothing above matched, so it must be an invalid expression
      throw new AssemblerError("parser.expected-argument").at(this.peek());
    }

    return NumberExpression.label(
      identifierToken.lexeme.toUpperCase(),
      offsetToken !== null,
      Position.merge(offsetToken?.position, identifierToken.position),
    );
  }

  private unaryNE(): NumberExpression {
    if (this.match("PLUS", "MINUS")) {
      const operatorToken = this.previous();

      // Prevent ambiguous cases like `(--1)` or `(+-1)`
      if (this.check("PLUS", "MINUS")) {
        throw new AssemblerError("parser.ambiguous-unary").at(this.peek());
      }

      const right = this.unaryNE();
      return NumberExpression.unaryOperation(
        operatorToken.type === "PLUS" ? "+" : "-",
        right,
        Position.merge(operatorToken.position, right.position),
      );
    }

    return this.primaryNE();
  }

  private factorNE(): NumberExpression {
    let expression = this.unaryNE();

    while (this.match("ASTERISK")) {
      const right = this.unaryNE();
      expression = NumberExpression.binaryOperation(
        expression,
        "*",
        right,
        Position.merge(expression.position, right.position),
      );
    }

    return expression;
  }

  private termNE(): NumberExpression {
    let expression = this.factorNE();

    while (this.match("PLUS", "MINUS")) {
      const operatorToken = this.previous();
      const right = this.factorNE();
      expression = NumberExpression.binaryOperation(
        expression,
        operatorToken.type === "PLUS" ? "+" : "-",
        right,
        Position.merge(expression.position, right.position),
      );
    }

    return expression;
  }

  private numberExpression(): NumberExpression {
    return this.termNE();
  }
}
