import { klona } from "klona/json";
import type { Merge } from "type-fest";
import { CompilerError, includes, PositionRange } from "../common";
import { DATA_DIRECTIVES, INSTRUCTIONS, Token, TokenType } from "../lexer/tokens";
import type { DataDirectiveValue, NumberExpression, Statement } from "./grammar";

export class Parser {
  static config = {
    maxMemoryAddress: 0x3fff,
    maxByteValue: 0xff,
    maxWordValue: 0xffff,
    maxNegativeByteValue: -0x80,
    maxNegativeWordValue: -0x8000,
  };

  private current = 0;
  private statements: Statement[] = [];

  constructor(private tokens: Token[]) {}

  parseTokens(): Statement[] {
    this.current = 0;
    this.statements = [];

    while (!this.isAtEnd()) {
      if (this.check("EOL")) {
        this.advance();
        continue;
      }

      // First, parse special statements

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
      } else if (this.check("END")) {
        const token = this.advance();
        this.addStatement({
          type: "end",
          position: this.calculatePositionRange(token),
        });
        while (this.check("EOL")) {
          this.advance();
        }
        if (!this.isAtEnd()) {
          throw CompilerError.fromToken("END must be the last instruction", token);
        }
        continue;
      }

      let label: string | null = null;
      if (this.check("IDENTIFIER") && this.checkNext("COLON")) {
        const labelToken = this.advance();
        label = labelToken.lexeme.toUpperCase(); // all labels are uppercase
        const colonToken = this.advance();

        const duplicatedLabel = this.statements.find(s => "label" in s && s.label === label);
        if (duplicatedLabel) {
          throw CompilerError.fromPositionRange(
            `Duplicated label: ${label}`,
            this.calculatePositionRange(labelToken, colonToken),
          );
        }

        while (this.check("EOL")) {
          this.advance();
        }
      }

      const token = this.advance();
      if (includes(DATA_DIRECTIVES, token.type)) {
        let statement = {
          type: "data",
          directive: token.type,
          label,
          values: [] as DataDirectiveValue[],
          position: this.calculatePositionRange(token),
        } satisfies Statement;

        while (true) {
          if (this.check("STRING")) {
            const stringToken = this.advance();
            statement.values.push({
              type: "string",
              value: this.parseString(stringToken),
              position: this.calculatePositionRange(stringToken),
            });
          } else if (this.check("QUESTION_MARK")) {
            const questionMarkToken = this.advance();
            statement.values.push({
              type: "unassigned",
              position: this.calculatePositionRange(questionMarkToken),
            });
          } else {
            const calc = this.numberExpression();
            statement.values.push(calc);
          }

          if (this.check("COMMA")) {
            this.advance();
          } else {
            this.expectEOL();
            break;
          }
        }

        this.addStatement(statement);
      } else if (includes(INSTRUCTIONS, token.type)) {
        // TODO
      } else {
        throw CompilerError.fromToken(`Expected instruction, got ${token.type}`, token);
      }
    }

    return this.statements;
  }

  // #=========================================================================#
  // # Helpers                                                                 #
  // #=========================================================================#

  private addStatement(statement: Statement) {
    // Clones the statement to prevent mutation
    this.statements.push(klona(statement));
  }

  private advance() {
    return this.tokens[this.current++];
  }

  private calculatePositionRange(...tokens: [Token, ...Token[]]): PositionRange {
    let leftmost = tokens[0];
    let rightmost = tokens[0];

    for (const token of tokens) {
      if (token.position[0] < leftmost.position[0]) leftmost = token;
      else if (token.position[0] > rightmost.position[0]) rightmost = token;
      else if (token.position[1] < leftmost.position[1]) leftmost = token;
      else rightmost = token; // There will never be a two tokens with the same position
    }

    return [
      [...leftmost.position],
      [rightmost.position[0], rightmost.position[1] + rightmost.lexeme.length],
    ];
  }

  private check(type: TokenType) {
    return this.peek().type === type;
  }

  private checkNext(type: TokenType) {
    return this.peekNext().type === type;
  }

  private consume<T extends TokenType>(type: T, onError?: string): Merge<Token, { type: T }> {
    if (!this.check(type)) {
      throw CompilerError.fromToken(
        (onError || `Expected ${type}`) + `, got ${this.peek().lexeme}`,
        this.peek(),
      );
    }
    return this.advance() as any;
  }

  private expectEOL() {
    if (this.isAtEnd()) {
      throw CompilerError.fromToken(`The program must end with an END instruction.`, this.peek());
    }
    if (!this.check("EOL")) {
      throw CompilerError.fromToken(`Expected EOL, got ${this.peek().type}`, this.peek());
    }
    return this.advance();
  }

  private isAtEnd() {
    return this.check("EOF");
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
      const identifierToken = this.consume("IDENTIFIER", "Expected label after OFFSET");
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
      const rparen = this.consume("RIGHT_PAREN", "Expected )");
      return {
        ...expression,
        position: this.calculatePositionRange(lparen, rparen),
      };
    }

    throw CompilerError.fromToken("Expected argument", this.peek());
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
