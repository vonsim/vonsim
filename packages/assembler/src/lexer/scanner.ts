import { Position } from "@vonsim/common/position";

import { CompilerError } from "../error";
import { Keyword, KEYWORDS } from "../types";
import { Token, TokenType } from "./tokens";

/**
 * The Scanner
 *
 * Is responsible for taking a string of source code and turning it into a
 * list of tokens.
 *
 * It is a class because it maintains state as it scans the source code, although
 * it could be refactored to be pure functions.
 *
 * ---
 * This class is: MUTABLE
 */
export class Scanner {
  /**
   * Prevents the scanner from being used more than once.
   */
  private scanned = false;

  /**
   * Tokens scanned so far.
   */
  private tokens: Token[] = [];

  /**
   * The position of the characters being scanned.
   * It's saved as a range (start, end) because it can be a multi-byte character.
   * The current character will be `position.end`
   */
  private position = new Position(0);

  constructor(private source: string) {}

  scanTokens(): Token[] {
    if (this.scanned) throw new Error("Scanner has already been used.");
    else this.scanned = true;

    while (!this.isAtEnd()) {
      this.position = new Position(this.position.end);

      const c = this.advance();
      switch (c) {
        case "(":
          this.addToken("LEFT_PAREN");
          continue;
        case ")":
          this.addToken("RIGHT_PAREN");
          continue;
        case "[":
          this.addToken("LEFT_BRACKET");
          continue;
        case "]":
          this.addToken("RIGHT_BRACKET");
          continue;
        case ",":
          this.addToken("COMMA");
          continue;
        case "?":
          this.addToken("QUESTION_MARK");
          continue;
        case "+":
          this.addToken("PLUS");
          continue;
        case "-":
          this.addToken("MINUS");
          continue;
        case "*":
          this.addToken("ASTERISK");
          continue;

        // Read string
        case '"':
          while (this.peek() !== '"') {
            if (this.isAtEnd() || this.peek() === "\n") {
              throw new CompilerError("lexer.unterminated-string").at(this.position);
            }
            if (this.peek().charCodeAt(0) > 255) {
              throw new CompilerError("lexer.only-ascii").at(
                new Position(this.position.end, this.position.end + 1),
              );
            }
            this.advance();
          }
          this.advance();
          this.addToken("STRING");
          continue;

        // Consume comment
        case ";":
          // Consume comment until end of line.
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
          continue;

        // Ignore whitespace
        case " ":
        case "\r":
        case "\t":
          continue;

        case "\n":
          this.addToken("EOL");
          continue;
      }

      // Numbers
      if (this.isDigit(c)) {
        while (
          this.isDigit(this.peek()) ||
          (this.peek() >= "a" && this.peek() <= "f") ||
          (this.peek() >= "A" && this.peek() <= "F")
        ) {
          this.advance();
        }

        if (this.peek() === "H" || this.peek() === "h") {
          // By this point, we know that the number is a hexadecimal number.
          this.advance();
        } else {
          const text = this.source.slice(this.position.start, this.position.end);
          if (text.at(-1) === "b" || text.at(-1) === "B") {
            // Should be a binary number.
            if (!/^[01]+b$/i.test(text)) {
              throw new CompilerError("lexer.invalid-binary").at(this.position);
            }
          } else {
            // Should be a decimal number.
            if (!/^\d+$/.test(text)) {
              throw new CompilerError("lexer.invalid-decimal").at(this.position);
            }
          }
        }

        this.addToken("NUMBER");
        continue;
      }

      // Identifiers
      if (this.isAlpha(c)) {
        while (this.isAlphaNumeric(this.peek())) {
          this.advance();
        }

        // Check if the identifier is a reserved word.
        const text = this.source.slice(this.position.start, this.position.end).toUpperCase();
        if (KEYWORDS.includes(text)) {
          this.addToken(text as Keyword);
        } else if (this.peek() === ":") {
          this.advance();
          this.addToken("LABEL");
        } else {
          this.addToken("IDENTIFIER");
        }

        continue;
      }

      throw new CompilerError("lexer.unexpected-character", c).at(this.position);
    }

    this.position = new Position(this.position.end);
    this.addToken("EOF");
    return this.tokens;
  }

  // #=========================================================================#
  // # Helpers                                                                 #
  // #=========================================================================#

  private addToken(type: TokenType) {
    this.tokens.push(
      new Token(type, this.source.slice(this.position.start, this.position.end), this.position),
    );
  }

  private advance() {
    const char = this.source.charAt(this.position.end);
    this.position = new Position(this.position.start, this.position.end + 1);
    return char;
  }

  private isAlpha(c: string) {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isAtEnd() {
    return this.position.end >= this.source.length;
  }

  private isDigit(c: string) {
    return c >= "0" && c <= "9";
  }

  private peek() {
    return this.isAtEnd() ? "\0" : this.source.charAt(this.position.end);
  }
}
