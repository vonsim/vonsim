import { describe, expect, it } from "vitest";

import { Scanner } from "@/compiler/lexer/scanner";

const lex = (input: string) => new Scanner(input).scanTokens();

describe("Strings", () => {
  it("lex a string", () => {
    expect(lex('"My string"')).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "\\"My string\\"",
          "position": 0,
          "type": "STRING",
        },
        {
          "lexeme": "",
          "position": 11,
          "type": "EOF",
        },
      ]
    `);
  });

  it("not avoid extra quotes", () => {
    expect(lex('"My string with extra "quotes""')).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "\\"My string with extra \\"",
          "position": 0,
          "type": "STRING",
        },
        {
          "lexeme": "quotes",
          "position": 23,
          "type": "IDENTIFIER",
        },
        {
          "lexeme": "\\"\\"",
          "position": 29,
          "type": "STRING",
        },
        {
          "lexeme": "",
          "position": 31,
          "type": "EOF",
        },
      ]
    `);
  });

  it("unterminated strings", () => {
    expect(() => lex('"My unterminated string')).toThrowErrorMatchingInlineSnapshot(
      '"Unterminated string. (0:23)"',
    );
  });

  it("only ASCII", () => {
    expect(() => lex('"My Unicode string αβγ"')).toThrowErrorMatchingInlineSnapshot(
      '"Only ASCII character are supported for strings. (19:20)"',
    );
  });
});

describe("Numbers", () => {
  it("decimal", () => {
    expect(lex("0")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "0",
          "position": 0,
          "type": "NUMBER",
        },
        {
          "lexeme": "",
          "position": 1,
          "type": "EOF",
        },
      ]
    `);
    expect(lex("12")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "12",
          "position": 0,
          "type": "NUMBER",
        },
        {
          "lexeme": "",
          "position": 2,
          "type": "EOF",
        },
      ]
    `);
    expect(lex("0123456789")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "0123456789",
          "position": 0,
          "type": "NUMBER",
        },
        {
          "lexeme": "",
          "position": 10,
          "type": "EOF",
        },
      ]
    `);
  });

  it("decimal with hex characters", () => {
    expect(() => lex("4a")).toThrowErrorMatchingInlineSnapshot(
      '"Invalid decimal number. It should only contain digits. (0:2)"',
    );
  });

  it("no decimal points", () => {
    expect(() => lex("1.2")).toThrowErrorMatchingInlineSnapshot(
      '"Unexpected character \\".\\". (1:2)"',
    );
    expect(() => lex(".1")).toThrowErrorMatchingInlineSnapshot(
      '"Unexpected character \\".\\". (0:1)"',
    );
  });

  it("binary", () => {
    expect(lex("11b")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "11b",
          "position": 0,
          "type": "NUMBER",
        },
        {
          "lexeme": "",
          "position": 3,
          "type": "EOF",
        },
      ]
    `);
    expect(lex("00B")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "00B",
          "position": 0,
          "type": "NUMBER",
        },
        {
          "lexeme": "",
          "position": 3,
          "type": "EOF",
        },
      ]
    `);
  });

  it("invalid binary", () => {
    expect(() => lex("02b")).toThrowErrorMatchingInlineSnapshot(
      '"Invalid binary number. It should only contain 0s and 1s. (0:3)"',
    );
    expect(() => lex("60b")).toThrowErrorMatchingInlineSnapshot(
      '"Invalid binary number. It should only contain 0s and 1s. (0:3)"',
    );
  });

  it("hexadecimal", () => {
    expect(lex("0h")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "0h",
          "position": 0,
          "type": "NUMBER",
        },
        {
          "lexeme": "",
          "position": 2,
          "type": "EOF",
        },
      ]
    `);
    expect(lex("5H")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "5H",
          "position": 0,
          "type": "NUMBER",
        },
        {
          "lexeme": "",
          "position": 2,
          "type": "EOF",
        },
      ]
    `);
    expect(lex("01223456789ABCDEFh")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "01223456789ABCDEFh",
          "position": 0,
          "type": "NUMBER",
        },
        {
          "lexeme": "",
          "position": 18,
          "type": "EOF",
        },
      ]
    `);
    expect(lex("0ffh")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "0ffh",
          "position": 0,
          "type": "NUMBER",
        },
        {
          "lexeme": "",
          "position": 4,
          "type": "EOF",
        },
      ]
    `);
  });

  it("FFh should be an IDENTIFIER", () => {
    expect(lex("FFh")).toMatchInlineSnapshot(`
      [
        {
          "lexeme": "FFh",
          "position": 0,
          "type": "IDENTIFIER",
        },
        {
          "lexeme": "",
          "position": 3,
          "type": "EOF",
        },
      ]
    `);
  });
});