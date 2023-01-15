import { describe, expect, it } from "vitest";

import { Scanner } from "@/compiler/lexer/scanner";
import { Parser } from "@/compiler/parser/parser";

const lex = (input: string) => new Scanner(input).scanTokens();
const parse = (input: string) => new Parser(lex(input)).parseTokens();

describe("ORG", () => {
  it("must have a value", () => {
    expect(() => parse("ORG")).toThrowErrorMatchingInlineSnapshot(
      '"Expected address after ORG. (3:3)"',
    );
  });
  it("accepts any number literal", () => {
    expect(parse("ORG 10")).toMatchInlineSnapshot(`
      [
        {
          "newAddress": 10,
          "position": [
            0,
            6,
          ],
          "type": "origin-change",
        },
      ]
    `);
    expect(parse("org 100h")).toMatchInlineSnapshot(`
      [
        {
          "newAddress": 256,
          "position": [
            0,
            8,
          ],
          "type": "origin-change",
        },
      ]
    `);
  });
  it("doesn't accept negatives", () => {
    expect(() => parse("ORG -10")).toThrowErrorMatchingInlineSnapshot(
      '"Expected address after ORG. (4:5)"',
    );
  });
  it("doesn't accept labels", () => {
    expect(() => parse("ORG label")).toThrowErrorMatchingInlineSnapshot(
      '"Expected address after ORG. (4:9)"',
    );
  });
});

describe("END", () => {
  it("only one END", () => {
    expect(() => parse("END\nEND")).toThrowErrorMatchingInlineSnapshot(
      '"END must be the last statement. (0:3)"',
    );
    expect(() => parse("END END")).toThrowErrorMatchingInlineSnapshot(
      '"END must be the last statement. (0:3)"',
    );
    expect(() => parse("ORG 1000h\nEND\nMOV AX, BX\nEND")).toThrowErrorMatchingInlineSnapshot(
      '"END must be the last statement. (10:13)"',
    );
  });

  it("END must be the last instruction", () => {
    expect(() => parse("ORG 1000h\nEND\nMOV AX, BX")).toThrowErrorMatchingInlineSnapshot(
      '"END must be the last statement. (10:13)"',
    );
    expect(parse("END")).toMatchInlineSnapshot(`
      [
        {
          "position": [
            0,
            3,
          ],
          "type": "end",
        },
      ]
    `);
    expect(parse("END\n\n\n\n\n")).toMatchInlineSnapshot(`
      [
        {
          "position": [
            0,
            3,
          ],
          "type": "end",
        },
      ]
    `);
    expect(parse("END;some comment")).toMatchInlineSnapshot(`
      [
        {
          "position": [
            0,
            3,
          ],
          "type": "end",
        },
      ]
    `);
    expect(parse("END;some other comment\n\n\n")).toMatchInlineSnapshot(`
      [
        {
          "position": [
            0,
            3,
          ],
          "type": "end",
        },
      ]
    `);
  });
});

describe("Labels", () => {
  it("no duplicates", () => {
    expect(() => parse("data DB 1 \n data DW 1")).toThrowErrorMatchingInlineSnapshot(
      '"Duplicated label \\"label\\". (12:16)"',
    );
    expect(() => parse("DATA DB 1 \n data DW 1")).toThrowErrorMatchingInlineSnapshot(
      '"Duplicated label \\"label\\". (12:16)"',
    );
    expect(() => parse("label DB 1 \n label: HLT")).toThrowErrorMatchingInlineSnapshot(
      '"Duplicated label \\"label\\". (13:19)"',
    );
    expect(parse("DATA DB 1\ndata2 DW 1")).toMatchInlineSnapshot(`
      [
        {
          "directive": "DB",
          "label": "DATA",
          "position": [
            5,
            7,
          ],
          "type": "data",
          "values": [
            {
              "position": [
                8,
                9,
              ],
              "type": "number-literal",
              "value": 1,
            },
          ],
        },
        {
          "directive": "DW",
          "label": "DATA2",
          "position": [
            16,
            18,
          ],
          "type": "data",
          "values": [
            {
              "position": [
                19,
                20,
              ],
              "type": "number-literal",
              "value": 1,
            },
          ],
        },
      ]
    `);
  });

  it("one label per line", () => {
    expect(() => parse("data data DB 1")).toThrowErrorMatchingInlineSnapshot(
      '"Expected identifier, got IDENTIFIER. (0:4)"',
    );
    expect(() => parse("label: label: HLT")).toThrowErrorMatchingInlineSnapshot(
      '"Expected instruction after label, got LABEL. (7:13)"',
    );
    expect(() => parse("label: data HLT")).toThrowErrorMatchingInlineSnapshot(
      '"Expected instruction after label, got IDENTIFIER. (7:11)"',
    );
    expect(() => parse("data label: HLT")).toThrowErrorMatchingInlineSnapshot(
      '"Expected identifier, got IDENTIFIER. (0:4)"',
    );
  });

  it("no colon for data directives", () => {
    expect(() => parse("data: DB 1")).toThrowErrorMatchingInlineSnapshot(
      '"Expected instruction after label, got DB. (6:8)"',
    );
    expect(parse("data DB 1")).toMatchInlineSnapshot(`
      [
        {
          "directive": "DB",
          "label": "DATA",
          "position": [
            5,
            7,
          ],
          "type": "data",
          "values": [
            {
              "position": [
                8,
                9,
              ],
              "type": "number-literal",
              "value": 1,
            },
          ],
        },
      ]
    `);
  });

  it("colon for data directives", () => {
    expect(() => parse("label HLT")).toThrowErrorMatchingInlineSnapshot(
      '"Expected identifier, got IDENTIFIER. (0:5)"',
    );
    expect(parse("label: HLT")).toMatchInlineSnapshot(`
      [
        {
          "instruction": "HLT",
          "label": "LABEL",
          "operands": [],
          "position": [
            7,
            10,
          ],
          "type": "instruction",
        },
      ]
    `);
  });
});
