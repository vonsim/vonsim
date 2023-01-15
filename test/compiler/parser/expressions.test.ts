import { describe, expect, it } from "vitest";

import { Scanner } from "@/compiler/lexer/scanner";
import { Parser } from "@/compiler/parser/parser";

const lex = (input: string) => new Scanner(input).scanTokens();
const parse = (input: string) => new Parser(lex(input)).parseTokens();

describe("Number literals", () => {
  it("decimal", () => {
    expect(parse("DB 10")).toMatchInlineSnapshot(`
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
                5,
              ],
              "type": "number-literal",
              "value": 10,
            },
          ],
        },
      ]
    `);
  });
  it("binary", () => {
    expect(parse("DB 10b")).toMatchInlineSnapshot(`
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
                6,
              ],
              "type": "number-literal",
              "value": 2,
            },
          ],
        },
      ]
    `);
  });
  it("hexadecimal", () => {
    expect(parse("DB 10h")).toMatchInlineSnapshot(`
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
                6,
              ],
              "type": "number-literal",
              "value": 16,
            },
          ],
        },
      ]
    `);
  });
});

it("label", () => {
  expect(parse("DB label")).toMatchInlineSnapshot(`
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
            "offset": false,
            "position": [
              3,
              8,
            ],
            "type": "label",
            "value": "LABEL",
          },
        ],
      },
    ]
  `);
  expect(() => parse("DB label:")).toThrowErrorMatchingInlineSnapshot('"Expected argument. (3:9)"');
  expect(() => parse("DB 1abel")).toThrowErrorMatchingInlineSnapshot(
    '"Invalid decimal number. It should only contain digits. (3:7)"',
  );
});

it("labels with offset", () => {
  expect(parse("DB OFFSET label")).toMatchInlineSnapshot(`
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
        ],
      },
    ]
  `);
  expect(() => parse("DB offset")).toThrowErrorMatchingInlineSnapshot(
    '"Expected label after OFFSET. (9:9)"',
  );
  expect(() => parse("DB OFFSET 1")).toThrowErrorMatchingInlineSnapshot(
    '"Expected label after OFFSET. (10:11)"',
  );
  expect(() => parse("DB OFFSET, label")).toThrowErrorMatchingInlineSnapshot(
    '"Expected label after OFFSET. (9:10)"',
  );
});

it("unary", () => {
  expect(parse("DB +1b")).toMatchInlineSnapshot(`
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
            "operator": "+",
            "position": [
              3,
              6,
            ],
            "right": {
              "position": [
                4,
                6,
              ],
              "type": "number-literal",
              "value": 1,
            },
            "type": "unary-operation",
          },
        ],
      },
    ]
  `);
  expect(parse("DB -(const)")).toMatchInlineSnapshot(`
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
            "operator": "-",
            "position": [
              3,
              11,
            ],
            "right": {
              "offset": false,
              "position": [
                4,
                11,
              ],
              "type": "label",
              "value": "CONST",
            },
            "type": "unary-operation",
          },
        ],
      },
    ]
  `);
  expect(() => parse("DB --1")).toThrowErrorMatchingInlineSnapshot(
    '"Unexpected token: MINUS. (4:5)"',
  );
});

it("binary", () => {
  expect(parse("DB left + right")).toMatchInlineSnapshot(`
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
            "left": {
              "offset": false,
              "position": [
                3,
                7,
              ],
              "type": "label",
              "value": "LEFT",
            },
            "operator": "+",
            "position": [
              3,
              15,
            ],
            "right": {
              "offset": false,
              "position": [
                10,
                15,
              ],
              "type": "label",
              "value": "RIGHT",
            },
            "type": "binary-operation",
          },
        ],
      },
    ]
  `);
  expect(parse("DB OFFSET a - OFFSET b")).toMatchInlineSnapshot(`
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
            "left": {
              "offset": true,
              "position": [
                3,
                11,
              ],
              "type": "label",
              "value": "A",
            },
            "operator": "-",
            "position": [
              3,
              22,
            ],
            "right": {
              "offset": true,
              "position": [
                14,
                22,
              ],
              "type": "label",
              "value": "B",
            },
            "type": "binary-operation",
          },
        ],
      },
    ]
  `);
  expect(parse("DB 2 + 3 * 4")).toMatchInlineSnapshot(`
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
            "left": {
              "position": [
                3,
                4,
              ],
              "type": "number-literal",
              "value": 2,
            },
            "operator": "+",
            "position": [
              3,
              12,
            ],
            "right": {
              "left": {
                "position": [
                  7,
                  8,
                ],
                "type": "number-literal",
                "value": 3,
              },
              "operator": "*",
              "position": [
                7,
                12,
              ],
              "right": {
                "position": [
                  11,
                  12,
                ],
                "type": "number-literal",
                "value": 4,
              },
              "type": "binary-operation",
            },
            "type": "binary-operation",
          },
        ],
      },
    ]
  `);
  expect(parse("DB 2 * 3 + 4")).toMatchInlineSnapshot(`
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
            "left": {
              "left": {
                "position": [
                  3,
                  4,
                ],
                "type": "number-literal",
                "value": 2,
              },
              "operator": "*",
              "position": [
                3,
                8,
              ],
              "right": {
                "position": [
                  7,
                  8,
                ],
                "type": "number-literal",
                "value": 3,
              },
              "type": "binary-operation",
            },
            "operator": "+",
            "position": [
              3,
              12,
            ],
            "right": {
              "position": [
                11,
                12,
              ],
              "type": "number-literal",
              "value": 4,
            },
            "type": "binary-operation",
          },
        ],
      },
    ]
  `);
  expect(parse("DB 2 * (3 + 4)")).toMatchInlineSnapshot(`
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
            "left": {
              "position": [
                3,
                4,
              ],
              "type": "number-literal",
              "value": 2,
            },
            "operator": "*",
            "position": [
              3,
              14,
            ],
            "right": {
              "left": {
                "position": [
                  8,
                  9,
                ],
                "type": "number-literal",
                "value": 3,
              },
              "operator": "+",
              "position": [
                7,
                14,
              ],
              "right": {
                "position": [
                  12,
                  13,
                ],
                "type": "number-literal",
                "value": 4,
              },
              "type": "binary-operation",
            },
            "type": "binary-operation",
          },
        ],
      },
    ]
  `);
  expect(parse("DB 2 - -1")).toMatchInlineSnapshot(`
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
            "left": {
              "position": [
                3,
                4,
              ],
              "type": "number-literal",
              "value": 2,
            },
            "operator": "-",
            "position": [
              3,
              9,
            ],
            "right": {
              "operator": "-",
              "position": [
                7,
                9,
              ],
              "right": {
                "position": [
                  8,
                  9,
                ],
                "type": "number-literal",
                "value": 1,
              },
              "type": "unary-operation",
            },
            "type": "binary-operation",
          },
        ],
      },
    ]
  `);
  expect(parse("DB 2 *- 1")).toMatchInlineSnapshot(`
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
            "left": {
              "position": [
                3,
                4,
              ],
              "type": "number-literal",
              "value": 2,
            },
            "operator": "*",
            "position": [
              3,
              9,
            ],
            "right": {
              "operator": "-",
              "position": [
                6,
                9,
              ],
              "right": {
                "position": [
                  8,
                  9,
                ],
                "type": "number-literal",
                "value": 1,
              },
              "type": "unary-operation",
            },
            "type": "binary-operation",
          },
        ],
      },
    ]
  `);
  expect(() => parse("DB 2 -* 1")).toThrowErrorMatchingInlineSnapshot('"Expected argument. (6:7)"');
});

it("parentheses", () => {
  expect(parse("DB -(((0)))")).toMatchInlineSnapshot(`
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
            "operator": "-",
            "position": [
              3,
              11,
            ],
            "right": {
              "position": [
                4,
                11,
              ],
              "type": "number-literal",
              "value": 0,
            },
            "type": "unary-operation",
          },
        ],
      },
    ]
  `);
  expect(() => parse("DB ()")).toThrowErrorMatchingInlineSnapshot('"Expected argument. (4:5)"');
  expect(() => parse("DB ())")).toThrowErrorMatchingInlineSnapshot('"Expected argument. (4:5)"');
  expect(() => parse("DB (()")).toThrowErrorMatchingInlineSnapshot('"Expected argument. (5:6)"');
  expect(() => parse("DB -(+(-()))")).toThrowErrorMatchingInlineSnapshot(
    '"Expected argument. (9:10)"',
  );
});
