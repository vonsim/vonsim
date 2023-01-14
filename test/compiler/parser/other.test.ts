import { describe, expect, it } from "vitest";

import { Scanner } from "@/compiler/lexer/scanner";
import { Parser } from "@/compiler/parser/parser";

const lex = (input: string) => new Scanner(input).scanTokens();
const parse = (input: string) => new Parser(lex(input)).parseTokens();

describe("ORG", () => {
  it("must have a value", () => {
    expect(() => parse("ORG")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 3,
        "params": [
          {
            "en": "Expected address after ORG.",
          },
        ],
        "to": 3,
      }
    `);
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
    expect(() => parse("ORG -10")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 4,
        "params": [
          {
            "en": "Expected address after ORG.",
          },
        ],
        "to": 5,
      }
    `);
  });
  it("doesn't accept labels", () => {
    expect(() => parse("ORG label")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 4,
        "params": [
          {
            "en": "Expected address after ORG.",
          },
        ],
        "to": 9,
      }
    `);
  });
});

describe("END", () => {
  it("only one END", () => {
    expect(() => parse("END\nEND")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "end-must-be-the-last-statement",
        "from": 0,
        "params": [],
        "to": 3,
      }
    `);
    expect(() => parse("END END")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "end-must-be-the-last-statement",
        "from": 0,
        "params": [],
        "to": 3,
      }
    `);
    expect(() => parse("ORG 1000h\nEND\nMOV AX, BX\nEND")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "end-must-be-the-last-statement",
        "from": 10,
        "params": [],
        "to": 13,
      }
    `);
  });

  it("END must be the last instruction", () => {
    expect(() => parse("ORG 1000h\nEND\nMOV AX, BX")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "end-must-be-the-last-statement",
        "from": 10,
        "params": [],
        "to": 13,
      }
    `);
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
    expect(() => parse("data DB 1 \n data DW 1")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "duplicated-label",
        "from": 12,
        "params": [
          "label",
        ],
        "to": 16,
      }
    `);
    expect(() => parse("DATA DB 1 \n data DW 1")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "duplicated-label",
        "from": 12,
        "params": [
          "label",
        ],
        "to": 16,
      }
    `);
    expect(() => parse("label DB 1 \n label: HLT")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "duplicated-label",
        "from": 13,
        "params": [
          "label",
        ],
        "to": 19,
      }
    `);
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
    expect(() => parse("data data DB 1")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 0,
        "params": [
          {
            "en": "Expected identifier, got IDENTIFIER.",
          },
        ],
        "to": 4,
      }
    `);
    expect(() => parse("label: label: HLT")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 7,
        "params": [
          {
            "en": "Expected instruction after label, got LABEL.",
          },
        ],
        "to": 13,
      }
    `);
    expect(() => parse("label: data HLT")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 7,
        "params": [
          {
            "en": "Expected instruction after label, got IDENTIFIER.",
          },
        ],
        "to": 11,
      }
    `);
    expect(() => parse("data label: HLT")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 0,
        "params": [
          {
            "en": "Expected identifier, got IDENTIFIER.",
          },
        ],
        "to": 4,
      }
    `);
  });

  it("no colon for data directives", () => {
    expect(() => parse("data: DB 1")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 6,
        "params": [
          {
            "en": "Expected instruction after label, got DB.",
          },
        ],
        "to": 8,
      }
    `);
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
    expect(() => parse("label HLT")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 0,
        "params": [
          {
            "en": "Expected identifier, got IDENTIFIER.",
          },
        ],
        "to": 5,
      }
    `);
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
