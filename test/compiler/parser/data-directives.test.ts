import { expect, it } from "vitest";
import { Scanner } from "~/compiler/lexer/scanner";
import { Parser } from "~/compiler/parser/parser";

const lex = (input: string) => new Scanner(input).scanTokens();
const parse = (input: string) => new Parser(lex(input)).parseTokens();

it("no arguments", () => {
  expect(() => parse("DB")).toThrowErrorMatchingInlineSnapshot(`
    LineError {
      "code": "expected-argument",
      "from": 2,
      "params": [],
      "to": 2,
    }
  `);
  expect(() => parse("DW")).toThrowErrorMatchingInlineSnapshot(`
    LineError {
      "code": "expected-argument",
      "from": 2,
      "params": [],
      "to": 2,
    }
  `);
  expect(() => parse("equ")).toThrowErrorMatchingInlineSnapshot(`
    LineError {
      "code": "expected-argument",
      "from": 3,
      "params": [],
      "to": 3,
    }
  `);
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
  expect(() => parse('DB OFFSET "str"')).toThrowErrorMatchingInlineSnapshot(`
    LineError {
      "code": "custom",
      "from": 10,
      "params": [
        {
          "en": "Expected label after OFFSET.",
        },
      ],
      "to": 15,
    }
  `);
  expect(() => parse('DB "str" + 1')).toThrowErrorMatchingInlineSnapshot(`
    LineError {
      "code": "custom",
      "from": 9,
      "params": [
        {
          "en": "Expected end of statement.",
        },
      ],
      "to": 10,
    }
  `);
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
  expect(() => parse("DW ??")).toThrowErrorMatchingInlineSnapshot(`
    LineError {
      "code": "custom",
      "from": 4,
      "params": [
        {
          "en": "Expected end of statement.",
        },
      ],
      "to": 5,
    }
  `);
});
