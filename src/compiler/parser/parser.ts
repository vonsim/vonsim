import { klona } from "klona/json";
import { isMatching } from "ts-pattern";
import type { Merge } from "type-fest";

import {
  CompilerErrorMessages,
  LineError,
  Position,
  PositionRange,
  RegisterType,
} from "@/compiler/common";
import {
  dataDirectivePattern,
  instructionPattern,
  registerPattern,
} from "@/compiler/common/patterns";
import type { Token, TokenType } from "@/compiler/lexer/tokens";
import { Size } from "@/config";

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
      if (this.match("EOL")) continue;

      // First, parse END labels
      if (this.match("END")) {
        const token = this.previous();

        this.addStatement({
          type: "end",
          position: this.calculatePositionRange(token),
        });

        while (!this.isAtEnd()) {
          if (this.match("EOL")) continue;

          throw new LineError(
            "end-must-be-the-last-statement",
            ...this.calculatePositionRange(token),
          );
        }

        continue;
      }

      // Then, parse ORG changes
      if (this.match("ORG")) {
        const token = this.previous();
        const addressToken = this.consume("NUMBER", {
          en: "Expected address after ORG.",
          es: "Se esperaba una dirección después de ORG.",
        });
        const address = this.parseNumber(addressToken);

        this.addStatement({
          type: "origin-change",
          newAddress: address,
          position: this.calculatePositionRange(token, addressToken),
        });

        this.endOfStatement();
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

        while (this.match("COMMA")) {
          statement.values.push(this.dataDirectiveValue());
        }

        this.endOfStatement();
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

        while (this.match("COMMA")) {
          statement.operands.push(this.instructionOperand());
        }

        this.endOfStatement();
        this.addStatement(statement);
        continue;
      }

      throw new LineError(
        "custom",
        {
          en: `Expected instruction, got ${token.type}.`,
          es: `Se esperaba una instrucción, se obtuvo ${token.type}.`,
        },
        ...this.calculatePositionRange(token),
      );
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

    const from = leftmost.position;
    const to = (rightmost.position + rightmost.lexeme.length) as Position;

    return [from, to];
  }

  private check(...types: TokenType[]) {
    if (this.isAtEnd()) return false;

    for (const type of types) {
      if (this.peek().type === type) return true;
    }

    return false;
  }

  private consume<T extends TokenType>(
    type: T,
    messages?: CompilerErrorMessages,
  ): Merge<Token, { type: T }> {
    if (!this.check(type)) {
      messages ||= {
        en: `Expected ${type}, got ${this.peek().type}.`,
        es: `Se esperaba ${type}, se obtuvo ${this.peek().type}.`,
      };
      throw new LineError("custom", messages, ...this.calculatePositionRange(this.peek()));
    }
    return this.advance() as any;
  }

  private endOfStatement() {
    if (this.isAtEnd()) return;
    if (this.check("EOL")) return this.advance();

    throw new LineError(
      "custom",
      { en: "Expected end of statement.", es: "Se esperaba que la instrucción termine." },
      ...this.calculatePositionRange(this.peek()),
    );
  }

  private isAtEnd() {
    return this.peek().type === "EOF";
  }

  private isAtEndOfStatement() {
    return this.check("EOL") || this.isAtEnd();
  }

  private match(...types: TokenType[]) {
    if (this.check(...types)) return this.advance();
    else return null;
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

  private previous() {
    return this.tokens[this.current - 1];
  }

  // #=========================================================================#
  // # Parse labels                                                            #
  // #=========================================================================#

  private label(): string | null {
    let labelToken: Token | null = null;

    if (this.match("IDENTIFIER")) {
      labelToken = this.previous();

      if (!isMatching(dataDirectivePattern, this.peek().type)) {
        throw new LineError(
          "custom",
          {
            en: `Expected identifier, got ${labelToken.type}.`,
            es: `Se esperaba un identificador, se obtuvo ${labelToken.type}.`,
          },
          ...this.calculatePositionRange(labelToken),
        );
      }
    } else if (this.match("LABEL")) {
      labelToken = this.previous();

      while (this.match("EOL")) {
        continue;
      }

      const next = this.peek();
      if (!isMatching(instructionPattern, next.type)) {
        throw new LineError(
          "custom",
          {
            en: `Expected instruction after label, got ${next.type}.`,
            es: `Se esperaba una instrucción después de la etiqueta, se obtuvo ${next.type}.`,
          },
          ...this.calculatePositionRange(next),
        );
      }
    }

    if (!labelToken) return null;

    let label = labelToken.lexeme.toUpperCase(); // all labels are uppercase
    if (labelToken.type === "LABEL") label = label.slice(0, -1); // remove colon

    const duplicatedLabel = this.statements.find(s => "label" in s && s.label === label);
    if (duplicatedLabel) {
      throw new LineError("duplicated-label", "label", ...this.calculatePositionRange(labelToken));
    }

    return label;
  }

  // #=========================================================================#
  // # Parse operands                                                          #
  // #=========================================================================#

  private dataDirectiveValue(): DataDirectiveValue {
    if (this.match("STRING")) {
      const stringToken = this.previous();
      return {
        type: "string",
        value: this.parseString(stringToken),
        position: this.calculatePositionRange(stringToken),
      };
    }

    if (this.match("QUESTION_MARK")) {
      const questionMarkToken = this.previous();
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
      const start: Token = this.previous();
      let size: Size | "auto";
      if (start.type === "LEFT_BRACKET") {
        size = "auto";
      } else {
        size = start.type === "BYTE" ? "byte" : "word";
        this.consume("PTR", {
          en: `Expected "PTR" after "${size.toUpperCase()}".`,
          es: `Se esperaba "PTR" después de "${size.toUpperCase()}".`,
        });
        this.consume("LEFT_BRACKET", {
          en: `Expected "[" after "${size.toUpperCase()} PTR".`,
          es: `Se esperaba "[" después de "${size.toUpperCase()} PTR".`,
        });
      }

      if (this.match("BX")) {
        const rbracket = this.consume("RIGHT_BRACKET", {
          en: 'Expected "]" after "BX".',
          es: 'Se esperaba "]" después de "BX".',
        });
        return {
          type: "address",
          size,
          mode: "indirect",
          position: this.calculatePositionRange(start, rbracket),
        };
      } else {
        const calc = this.numberExpression();
        const rbracket = this.consume("RIGHT_BRACKET", {
          en: 'Expected "]" after expression.',
          es: 'Se esperaba "]" después de la expresión.',
        });
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

  private primaryNE(): NumberExpression {
    if (this.match("NUMBER")) {
      const numberToken = this.previous();
      const value = this.parseNumber(numberToken);
      return {
        type: "number-literal",
        value,
        position: this.calculatePositionRange(numberToken),
      };
    }

    if (this.match("OFFSET")) {
      const offsetToken = this.previous();
      const identifierToken = this.consume("IDENTIFIER", {
        en: "Expected label after OFFSET.",
        es: "Se esperaba una etiqueta después de OFFSET.",
      });
      return {
        type: "label",
        value: identifierToken.lexeme.toUpperCase(),
        offset: true,
        position: this.calculatePositionRange(offsetToken, identifierToken),
      };
    }

    if (this.match("IDENTIFIER")) {
      const identifierToken = this.previous();
      return {
        type: "label",
        value: identifierToken.lexeme.toUpperCase(),
        offset: false,
        position: this.calculatePositionRange(identifierToken),
      };
    }

    if (this.match("LEFT_PAREN")) {
      const lparen = this.previous();
      const expression = this.numberExpression();
      const rparen = this.consume("RIGHT_PAREN", {
        en: "Unclosed parenthesis.",
        es: "Paréntesis sin cerrar.",
      });
      return {
        ...expression,
        position: this.calculatePositionRange(lparen, rparen),
      };
    }

    throw new LineError("expected-argument", ...this.calculatePositionRange(this.peek()));
  }

  private unaryNE(): NumberExpression {
    if (this.match("PLUS", "MINUS")) {
      const operatorToken = this.previous();

      // Prevent ambiguous cases like `(--1)` or `(+-1)`
      if (this.check("PLUS", "MINUS")) {
        throw new LineError(
          "unexpected-token",
          this.peek(),
          ...this.calculatePositionRange(this.peek()),
        );
      }

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

  private factorNE(): NumberExpression {
    let expression = this.unaryNE();

    while (this.match("ASTERISK")) {
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
      const operatorToken = this.previous();
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
