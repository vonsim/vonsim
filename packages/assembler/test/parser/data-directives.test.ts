import { expect, it } from "vitest";

import { Scanner } from "../../src/lexer/scanner";
import { Parser } from "../../src/parser";

const lex = (input: string) => new Scanner(input).scanTokens();
const parse = (input: string) => new Parser(lex(input)).parse();

it("no arguments", () => {
  expect(() => parse("DB")).toThrowErrorMatchingInlineSnapshot(`[Error: Expected argument. (2)]`);
  expect(() => parse("DW")).toThrowErrorMatchingInlineSnapshot(`[Error: Expected argument. (2)]`);
  expect(() => parse("equ")).toThrowErrorMatchingInlineSnapshot(`[Error: Expected argument. (3)]`);
});

it("strings", () => {
  expect(parse('DB "str"')).toMatchInlineSnapshot(`
    [
      {
        "directive": "DB",
        "label": null,
        "position": [
          0,
          8,
        ],
        "type": "data-directive",
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
          21,
        ],
        "type": "data-directive",
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
          22,
        ],
        "type": "data-directive",
        "values": [
          {
            "position": [
              3,
              15,
            ],
            "type": "number-expression",
            "value": {
              "offset": true,
              "position": [
                3,
                15,
              ],
              "type": "label",
              "value": "LABEL",
            },
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
    `[Error: Expected label after OFFSET. (10:15)]`,
  );
  expect(() => parse('DB "str" + 1')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected end of statement. (9:10)]`,
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
          4,
        ],
        "type": "data-directive",
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
          10,
        ],
        "type": "data-directive",
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
    `[Error: Expected end of statement. (4:5)]`,
  );
});

it("DUP", () => {
  expect(parse("DB 3 DUP(1, 2), 3")).toMatchInlineSnapshot(`
    [
      {
        "directive": "DB",
        "label": null,
        "position": [
          0,
          17,
        ],
        "type": "data-directive",
        "values": [
          {
            "count": {
              "position": [
                3,
                4,
              ],
              "type": "number-literal",
              "value": 3,
            },
            "position": [
              3,
              14,
            ],
            "type": "duplicate",
            "values": [
              {
                "position": [
                  9,
                  10,
                ],
                "type": "number-expression",
                "value": {
                  "position": [
                    9,
                    10,
                  ],
                  "type": "number-literal",
                  "value": 1,
                },
              },
              {
                "position": [
                  12,
                  13,
                ],
                "type": "number-expression",
                "value": {
                  "position": [
                    12,
                    13,
                  ],
                  "type": "number-literal",
                  "value": 2,
                },
              },
            ],
          },
          {
            "position": [
              16,
              17,
            ],
            "type": "number-expression",
            "value": {
              "position": [
                16,
                17,
              ],
              "type": "number-literal",
              "value": 3,
            },
          },
        ],
      },
    ]
  `);
  expect(parse('DW 2 DUP(?, "a")')).toMatchInlineSnapshot(`
    [
      {
        "directive": "DW",
        "label": null,
        "position": [
          0,
          16,
        ],
        "type": "data-directive",
        "values": [
          {
            "count": {
              "position": [
                3,
                4,
              ],
              "type": "number-literal",
              "value": 2,
            },
            "position": [
              3,
              16,
            ],
            "type": "duplicate",
            "values": [
              {
                "position": [
                  9,
                  10,
                ],
                "type": "unassigned",
              },
              {
                "position": [
                  12,
                  15,
                ],
                "type": "string",
                "value": "a",
              },
            ],
          },
        ],
      },
    ]
  `);
  expect(parse("DB 2 DUP(2 DUP(1))")).toMatchInlineSnapshot(`
    [
      {
        "directive": "DB",
        "label": null,
        "position": [
          0,
          18,
        ],
        "type": "data-directive",
        "values": [
          {
            "count": {
              "position": [
                3,
                4,
              ],
              "type": "number-literal",
              "value": 2,
            },
            "position": [
              3,
              18,
            ],
            "type": "duplicate",
            "values": [
              {
                "count": {
                  "position": [
                    9,
                    10,
                  ],
                  "type": "number-literal",
                  "value": 2,
                },
                "position": [
                  9,
                  17,
                ],
                "type": "duplicate",
                "values": [
                  {
                    "position": [
                      15,
                      16,
                    ],
                    "type": "number-expression",
                    "value": {
                      "position": [
                        15,
                        16,
                      ],
                      "type": "number-literal",
                      "value": 1,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
  `);
  expect(parse("len equ 5\nDB len DUP(0)")).toMatchInlineSnapshot(`
    [
      {
        "directive": "EQU",
        "label": "LEN",
        "position": [
          4,
          9,
        ],
        "type": "data-directive",
        "value": [
          {
            "position": [
              8,
              9,
            ],
            "type": "number-expression",
            "value": {
              "position": [
                8,
                9,
              ],
              "type": "number-literal",
              "value": 5,
            },
          },
        ],
      },
      {
        "directive": "DB",
        "label": null,
        "position": [
          10,
          23,
        ],
        "type": "data-directive",
        "values": [
          {
            "count": {
              "offset": false,
              "position": [
                13,
                16,
              ],
              "type": "label",
              "value": "LEN",
            },
            "position": [
              13,
              23,
            ],
            "type": "duplicate",
            "values": [
              {
                "position": [
                  21,
                  22,
                ],
                "type": "number-expression",
                "value": {
                  "position": [
                    21,
                    22,
                  ],
                  "type": "number-literal",
                  "value": 0,
                },
              },
            ],
          },
        ],
      },
    ]
  `);
  expect(() => parse("DB 2 DUP(1, 2")).toThrowErrorMatchingInlineSnapshot(
    `[Error: Unclosed parenthesis. (13)]`,
  );
});
