import { klona } from "klona/json";
import { isMatching } from "ts-pattern";
import type { Merge } from "type-fest";
import { CompilerError, PositionRange, RegisterType } from "~/compiler/common";
import {
  dataDirectivePattern,
  instructionPattern,
  registerPattern,
} from "~/compiler/common/patterns";
import type { Token, TokenType } from "~/compiler/lexer/tokens";
import type { DataDirectiveValue, NumberExpression, Operand, Statement } from "./grammar";

/**
 * The parser is responsible for taking a list of tokens and turning it into a
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
 * The last two can have multiple operands separated by commas. Inside each operand,
 * there can be a number expression, which is a sequence of numbers and operators
 * that can be evaluated at compile time.
 *
 * The number expression parser is a recursive descent parser, which means that
 * it uses a set of functions to parse the tokens. Each function is responsible
 * for parsing a specific type of statement, and it calls other functions to parse
 * sub-parts of the statement.
 *
 * The parser is also responsible for validating the syntax of the source code.
 * For example, it will throw an error if it encounters a token that it doesn't
 * expect. More extensive validation is done by the semantic analyzer.
 */
export class Parser {
  private tokens: Token[];

  private current = 0;
  private statements: Statement[] = [];
  private parsed = false;

  constructor(tokens: Token[]) {
    this.tokens = klona(tokens);
  }

  parseTokens(): Statement[] {
    if (this.parsed) throw new Error("Parser has already been used.");
    else this.parsed = true;

    this.current = 0;
    this.statements = [];

    while (!this.isAtEnd()) {
      if (this.check("EOL")) {
        this.advance();
        continue;
      }

      // First, parse END labels
      if (this.check("END")) {
        const token = this.advance();

        this.addStatement({
          type: "end",
          position: this.calculatePositionRange(token),
        });

        while (!this.isAtEnd()) {
          if (this.check("EOL")) {
            this.advance();
            continue;
          }

          throw CompilerError.fromToken("end-must-be-the-last-statement", token);
        }

        continue;
      }

      // Then, parse ORG changes
      if (this.check("ORG")) {
        const token = this.advance();
        const addressToken = this.consume("NUMBER", "Expected address after ORG");
        const address = this.parseNumber(addressToken);

        this.addStatement({
          type: "origin-change",
          newAddress: address,
          position: this.calculatePositionRange(token, addressToken),
        });

        this.expectEOL();
        continue;
      }

      const label = this.label();
      const token = this.advance();

      if (isMatching(dataDirectivePattern, token.type)) {
        const statement = {
          type: "data",
          directive: token.type,
          label,
          values: [this.dataDirectiveValue()], // There must be at least one value
          position: this.calculatePositionRange(token),
        } satisfies Statement;

        while (this.check("COMMA")) {
          this.advance();
          statement.values.push(this.dataDirectiveValue());
        }

        this.expectEOL();

        this.addStatement(statement);
        continue;
      }

      if (isMatching(instructionPattern, token.type)) {
        const statement = {
          type: "instruction",
          instruction: token.type,
          label,
          operands: [] as Operand[],
          position: this.calculatePositionRange(token),
        } satisfies Statement;

        // Check for zeroary instructions
        if (this.isAtEndOfStatement()) {
          this.addStatement(statement);
          continue;
        } else {
          statement.operands.push(this.instructionOperand());
        }

        while (this.check("COMMA")) {
          this.advance();
          statement.operands.push(this.instructionOperand());
        }

        this.expectEOL();

        this.addStatement(statement);
        continue;
      }

      throw CompilerError.fromToken("expected-token", token, "instruction", token.type);
    }

    return this.statements;
  }

  // #=========================================================================#
  // # Helpers                                                                 #
  // #=========================================================================#

  private addStatement(statement: Statement) {
    this.statements.push(statement);
  }

  private advance() {
    return this.tokens[this.current++];
  }

  private calculatePositionRange(...tokens: [Token, ...Token[]]): PositionRange {
    let leftmost = tokens[0];
    let rightmost = tokens[0];

    for (const token of tokens) {
      if (token.position < leftmost.position) leftmost = token;
      else if (token.position > rightmost.position) rightmost = token;
    }

    return [leftmost.position, rightmost.position + rightmost.lexeme.length];
  }

  private check(type: TokenType) {
    return this.peek().type === type;
  }

  private checkNext(type: TokenType) {
    return this.peekNext().type === type;
  }

  private consume<T extends TokenType>(type: T, expected?: string): Merge<Token, { type: T }> {
    if (!this.check(type)) {
      throw CompilerError.fromToken(
        "expected-token",
        this.peek(),
        expected || type,
        this.peek().type,
      );
    }
    return this.advance() as any;
  }

  private expectEOL() {
    if (this.isAtEnd()) return;
    if (this.check("EOL")) return this.advance();
    throw CompilerError.fromToken("expected-token", this.peek(), "EOL", this.peek().type);
  }

  private isAtEnd() {
    return this.check("EOF");
  }

  private isAtEndOfStatement() {
    return this.check("EOL") || this.isAtEnd();
  }

  private match(...types: TokenType[]) {
    for (const type of types) {
      if (this.check(type)) {
        return true;
      }
    }

    return false;
  }

  private parseNumber(t: Token) {
    if (t.lexeme.at(-1) === "h" || t.lexeme.at(-1) === "H") {
      return parseInt(t.lexeme.slice(0, -1), 16);
    } else if (t.lexeme.at(-1) === "b" || t.lexeme.at(-1) === "B") {
      return parseInt(t.lexeme.slice(0, -1), 2);
    } else {
      return parseInt(t.lexeme, 10);
    }
  }

  private parseString(t: Token) {
    return t.lexeme.slice(1, -1);
  }

  private peek() {
    return this.tokens[this.current];
  }

  private peekNext() {
    return this.tokens[this.current + 1];
  }

  // #=========================================================================#
  // # Parse labels                                                            #
  // #=========================================================================#

  private label(): string | null {
    let labelToken: Token | null = null;

    if (this.check("IDENTIFIER")) {
      labelToken = this.advance();

      if (!isMatching(dataDirectivePattern, this.peek().type)) {
        throw CompilerError.fromToken("unexpected-token", labelToken, "identifier");
      }
    } else if (this.check("LABEL")) {
      labelToken = this.advance();

      while (this.check("EOL")) {
        this.advance();
      }

      if (!isMatching(instructionPattern, this.peek().type)) {
        throw CompilerError.fromToken(
          `expected-token`,
          this.peek(),
          "instruction after label",
          this.peek().type,
        );
      }
    }

    if (!labelToken) return null;

    let label = labelToken.lexeme.toUpperCase(); // all labels are uppercase
    if (labelToken.type === "LABEL") label = label.slice(0, -1); // remove colon

    const duplicatedLabel = this.statements.find(s => "label" in s && s.label === label);
    if (duplicatedLabel) {
      throw new CompilerError(
        "duplicated-label",
        ...this.calculatePositionRange(labelToken),
        "label",
      );
    }

    return label;
  }

  // #=========================================================================#
  // # Parse operands                                                          #
  // #=========================================================================#

  private dataDirectiveValue(): DataDirectiveValue {
    if (this.check("STRING")) {
      const stringToken = this.advance();
      return {
        type: "string",
        value: this.parseString(stringToken),
        position: this.calculatePositionRange(stringToken),
      };
    }

    if (this.check("QUESTION_MARK")) {
      const questionMarkToken = this.advance();
      return {
        type: "unassigned",
        position: this.calculatePositionRange(questionMarkToken),
      };
    }

    return this.numberExpression();
  }

  private instructionOperand(): Operand {
    if (isMatching(registerPattern, this.peek().type)) {
      const registerToken = this.advance() as Merge<Token, { type: RegisterType }>;
      return {
        type: "register",
        value: registerToken.type,
        position: this.calculatePositionRange(registerToken),
      };
    }

    if (this.match("BYTE", "WORD", "LEFT_BRACKET")) {
      let size: "auto" | "byte" | "word";
      let start: Token;
      if (this.check("LEFT_BRACKET")) {
        size = "auto";
        start = this.advance();
      } else {
        size = this.check("BYTE") ? "byte" : "word";
        start = this.advance();
        this.consume("PTR", `"PTR" after "${size.toUpperCase()}"`);
        this.consume("LEFT_BRACKET", `"[" after "${size.toUpperCase()} PTR"`);
      }

      if (this.check("BX")) {
        this.advance();
        const rbracket = this.consume("RIGHT_BRACKET", '"]" after "BX"');
        return {
          type: "address",
          size,
          mode: "indirect",
          position: this.calculatePositionRange(start, rbracket),
        };
      } else {
        const calc = this.numberExpression();
        const rbracket = this.consume("RIGHT_BRACKET", '"]" after expression');
        return {
          type: "address",
          size,
          mode: "direct",
          value: calc,
          position: this.calculatePositionRange(start, rbracket),
        };
      }
    }

    return this.numberExpression();
  }

  // #=========================================================================#
  // # Parse number expression (NE)                                            #
  // #=========================================================================#

  private unaryNE(): NumberExpression {
    if (this.match("PLUS", "MINUS")) {
      const operatorToken = this.advance();
      const right = this.unaryNE();
      return {
        type: "unary-operation",
        operator: operatorToken.type === "PLUS" ? "+" : "-",
        right,
        position: [operatorToken.position, right.position[1]],
      };
    }

    return this.primaryNE();
  }

  private primaryNE(): NumberExpression {
    if (this.check("NUMBER")) {
      const numberToken = this.advance();
      const value = this.parseNumber(numberToken);
      return {
        type: "number-literal",
        value,
        position: this.calculatePositionRange(numberToken),
      };
    }

    if (this.check("OFFSET")) {
      const offsetToken = this.advance();
      const identifierToken = this.consume("IDENTIFIER", "label after OFFSET");
      return {
        type: "label",
        value: identifierToken.lexeme.toUpperCase(),
        offset: true,
        position: this.calculatePositionRange(offsetToken, identifierToken),
      };
    }

    if (this.check("IDENTIFIER")) {
      const identifierToken = this.advance();
      return {
        type: "label",
        value: identifierToken.lexeme.toUpperCase(),
        offset: false,
        position: this.calculatePositionRange(identifierToken),
      };
    }

    if (this.check("LEFT_PAREN")) {
      const lparen = this.advance();
      let expression = this.numberExpression();
      const rparen = this.consume("RIGHT_PAREN", ")");
      return {
        ...expression,
        position: this.calculatePositionRange(lparen, rparen),
      };
    }

    throw CompilerError.fromToken("expected-argument", this.peek());
  }

  private factorNE(): NumberExpression {
    let expression = this.unaryNE();

    while (this.match("ASTERISK")) {
      this.advance();
      const right = this.unaryNE();
      expression = {
        type: "binary-operation",
        left: expression,
        right,
        operator: "*",
        position: [expression.position[0], right.position[1]],
      };
    }

    return expression;
  }

  private termNE(): NumberExpression {
    let expression = this.factorNE();

    while (this.match("PLUS", "MINUS")) {
      const operatorToken = this.advance();
      const right = this.factorNE();
      expression = {
        type: "binary-operation",
        left: expression,
        right,
        operator: operatorToken.type === "PLUS" ? "+" : "-",
        position: [expression.position[0], right.position[1]],
      };
    }

    return expression;
  }

  private numberExpression(): NumberExpression {
    return this.termNE();
  }
}
