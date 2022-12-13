import { CompilerError, Position } from "../common";
import { KEYWORDS, Token, TokenType } from "./tokens";

export class Scanner {
  private tokens: Token[] = [];
  private current = 0;
  private start = 0;
  private startPos: Position = new Position(1, 1);
  private currentPos: Position = new Position(1, 1);

  constructor(private source: string) {}

  private addToken(type: TokenType) {
    this.tokens.push(new Token(type, this.source.slice(this.start, this.current), this.startPos));
  }

  private advance() {
    this.currentPos = this.currentPos.forward();
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

  scanTokens(): Token[] {
    this.current = 0;
    this.start = 0;
    this.startPos = new Position(1, 1);
    this.currentPos = new Position(1, 1);
    this.tokens = [];

    while (!this.isAtEnd()) {
      this.start = this.current;
      this.startPos = this.currentPos.clone();

      const c = this.advance();
      switch (c) {
        case "[":
          this.addToken("LEFT_BRACKET");
          continue;
        case "]":
          this.addToken("RIGHT_BRACKET");
          continue;
        case ",":
          this.addToken("COMMA");
          continue;
        case ":":
          this.addToken("COLON");
          continue;
        case "+":
          this.addToken("PLUS");
          continue;
        case "-":
          this.addToken("MINUS");
          continue;

        case '"':
          while (this.peek() !== '"') {
            if (this.isAtEnd() || this.peek() === "\n") {
              throw new CompilerError("Unterminated string.", this.startPos, this.currentPos);
            }
            this.advance();
          }
          this.advance();
          this.addToken("STRING");
          continue;

        case ";":
          // Consume comment until end of line.
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
          continue;

        case " ":
        case "\r":
        case "\t":
          // Ignore whitespace.
          continue;

        case "\n":
          this.addToken("EOL");
          this.currentPos = this.currentPos.down();
          continue;
      }

      // Numbers
      if (this.isDigit(c)) {
        const start = c + this.peek().toLowerCase();

        if (start === "0x") {
          // Hexadecimal
          this.advance();
          while (
            this.isDigit(this.peek()) ||
            (this.peek() >= "a" && this.peek() <= "f") ||
            (this.peek() >= "A" && this.peek() <= "F")
          ) {
            this.advance();
          }
        } else if (start === "0b") {
          // Binary
          this.advance();
          while (this.peek() === "0" || this.peek() === "1") {
            this.advance();
          }
        } else {
          // Decimal
          while (this.isDigit(this.peek())) {
            this.advance();
          }
        }

        this.addToken("NUMBER");
        continue;
      }

      if (this.isAlpha(c)) {
        while (this.isAlphaNumeric(this.peek())) {
          this.advance();
        }

        // Check if the identifier is a reserved word.
        // The last 'as' is a hack to make TypeScript happy.
        const text = this.source
          .slice(this.start, this.current)
          .toUpperCase() as typeof KEYWORDS[number];

        if (KEYWORDS.includes(text)) this.addToken(text);
        else this.addToken("IDENTIFIER");
        continue;
      }

      throw new CompilerError(`Unexpected character "${c}".`, this.startPos, this.currentPos);
    }

    this.start = this.current;
    this.startPos = this.currentPos.clone();
    this.addToken("EOF");
    return this.tokens;
  }
}
