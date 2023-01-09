import { isMatching } from "ts-pattern";
import { LineError, Position } from "~/compiler/common";
import { keywordPattern } from "~/compiler/common/patterns";
import { Token, TokenType } from "./tokens";

/**
 * This class is responsible for taking a string of source code and turning it
 * into a list of tokens.
 *
 * It is a class because it maintains state as it scans the source code, although
 * it could be refactored to be pure functions.
 */

export class Scanner {
  private tokens: Token[] = [];
  private current: Position = 0;
  private start: Position = 0;
  private scanned = false;

  constructor(private source: string) {}

  scanTokens(): Token[] {
    if (this.scanned) throw new Error("Scanner has already been used.");
    else this.scanned = true;

    while (!this.isAtEnd()) {
      this.start = this.current;

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
              throw new LineError("unterminated-string", this.start, this.current);
            }
            if (this.peek().charCodeAt(0) > 255) {
              throw new LineError("only-ascii", this.current, this.current + 1);
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
          const text = this.source.slice(this.start, this.current);
          if (text.at(-1) === "b" || text.at(-1) === "B") {
            // Should be a binary number.
            if (!/^[01]+b$/i.test(text)) {
              throw new LineError("invalid-binary", this.start, this.current);
            }
          } else {
            // Should be a decimal number.
            if (!/^\d+$/.test(text)) {
              throw new LineError("invalid-decimal", this.start, this.current);
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
        const text = this.source.slice(this.start, this.current).toUpperCase();
        if (isMatching(keywordPattern, text)) {
          this.addToken(text);
        } else if (this.peek() === ":") {
          this.advance();
          this.addToken("LABEL");
        } else {
          this.addToken("IDENTIFIER");
        }

        continue;
      }

      throw new LineError("unexpected-character", c, this.start, this.current);
    }

    this.start = this.current;
    this.addToken("EOF");
    return this.tokens;
  }

  // #=========================================================================#
  // # Helpers                                                                 #
  // #=========================================================================#

  private addToken(type: TokenType) {
    this.tokens.push({
      type,
      lexeme: this.source.slice(this.start, this.current),
      position: this.start,
    });
  }

  private advance() {
    return this.source.charAt(this.current++);
  }

  private isAlpha(c: string) {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isAtEnd() {
    return this.current >= this.source.length;
  }

  private isDigit(c: string) {
    return c >= "0" && c <= "9";
  }

  private peek() {
    return this.isAtEnd() ? "\0" : this.source.charAt(this.current);
  }
}
