import { expect, it } from "vitest";

import { Scanner } from "@/compiler/lexer/scanner";
import { Parser } from "@/compiler/parser/parser";

const lex = (input: string) => new Scanner(input).scanTokens();
const parse = (input: string) => new Parser(lex(input)).parseTokens();

it("no arguments", () => {
  expect(() => parse("DB")).toThrowErrorMatchingInlineSnapshot('"Expected argument. (2:2)"');
  expect(() => parse("DW")).toThrowErrorMatchingInlineSnapshot('"Expected argument. (2:2)"');
  expect(() => parse("equ")).toThrowErrorMatchingInlineSnapshot('"Expected argument. (3:3)"');
});

it("strings", () => {
  expect(parse('DB "str"')).toMatchInlineSnapshot(`
    [
      {
        "directive": "DB",
        "label": null,
        "position": [
          0,
          2,
        ],
        "type": "data",
        "values": [
          {
            "position": [
              3,
              8,
            ],
            "type": "string",
            "value": "str",
          },
        ],
      },
    ]
  `);
  expect(parse('DB "str", "other str"')).toMatchInlineSnapshot(`
    [
      {
        "directive": "DB",
        "label": null,
        "position": [
          0,
          2,
        ],
        "type": "data",
        "values": [
          {
            "position": [
              3,
              8,
            ],
            "type": "string",
            "value": "str",
          },
          {
            "position": [
              10,
              21,
            ],
            "type": "string",
            "value": "other str",
          },
        ],
      },
    ]
  `);
  expect(parse('DB OFFSET label, "str"')).toMatchInlineSnapshot(`
    [
      {
        "directive": "DB",
        "label": null,
        "position": [
          0,
          2,
        ],
        "type": "data",
        "values": [
          {
            "offset": true,
            "position": [
              3,
              15,
            ],
            "type": "label",
            "value": "LABEL",
          },
          {
            "position": [
              17,
              22,
            ],
            "type": "string",
            "value": "str",
          },
        ],
      },
    ]
  `);
  expect(() => parse('DB OFFSET "str"')).toThrowErrorMatchingInlineSnapshot(
    '"Expected label after OFFSET. (10:15)"',
  );
  expect(() => parse('DB "str" + 1')).toThrowErrorMatchingInlineSnapshot(
    '"Expected end of statement. (9:10)"',
  );
});

it("unassigned", () => {
  expect(parse("DB ?")).toMatchInlineSnapshot(`
    [
      {
        "directive": "DB",
        "label": null,
        "position": [
          0,
          2,
        ],
        "type": "data",
        "values": [
          {
            "position": [
              3,
              4,
            ],
            "type": "unassigned",
          },
        ],
      },
    ]
  `);
  expect(parse("DB ?, ?, ?")).toMatchInlineSnapshot(`
    [
      {
        "directive": "DB",
        "label": null,
        "position": [
          0,
          2,
        ],
        "type": "data",
        "values": [
          {
            "position": [
              3,
              4,
            ],
            "type": "unassigned",
          },
          {
            "position": [
              6,
              7,
            ],
            "type": "unassigned",
          },
          {
            "position": [
              9,
              10,
            ],
            "type": "unassigned",
          },
        ],
      },
    ]
  `);
  expect(() => parse("DW ??")).toThrowErrorMatchingInlineSnapshot(
    '"Expected end of statement. (4:5)"',
  );
});
