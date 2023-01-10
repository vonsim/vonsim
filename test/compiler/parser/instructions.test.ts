import { describe, expect, it } from "vitest";
import { Scanner } from "~/compiler/lexer/scanner";
import { Parser } from "~/compiler/parser/parser";

const lex = (input: string) => new Scanner(input).scanTokens();
const parse = (input: string) => new Parser(lex(input)).parseTokens();

it("no operands", () => {
  expect(parse("HLT")).toMatchInlineSnapshot(`
    [
      {
        "instruction": "HLT",
        "label": null,
        "operands": [],
        "position": [
          0,
          3,
        ],
        "type": "instruction",
      },
    ]
  `);
});

it("multiple operands", () => {
  expect(parse("POP AX")).toMatchInlineSnapshot(`
    [
      {
        "instruction": "POP",
        "label": null,
        "operands": [
          {
            "position": [
              4,
              6,
            ],
            "type": "register",
            "value": "AX",
          },
        ],
        "position": [
          0,
          3,
        ],
        "type": "instruction",
      },
    ]
  `);
  expect(parse("MOV BX, 1 + OFFSET label")).toMatchInlineSnapshot(`
    [
      {
        "instruction": "MOV",
        "label": null,
        "operands": [
          {
            "position": [
              4,
              6,
            ],
            "type": "register",
            "value": "BX",
          },
          {
            "left": {
              "position": [
                8,
                9,
              ],
              "type": "number-literal",
              "value": 1,
            },
            "operator": "+",
            "position": [
              8,
              24,
            ],
            "right": {
              "offset": true,
              "position": [
                12,
                24,
              ],
              "type": "label",
              "value": "LABEL",
            },
            "type": "binary-operation",
          },
        ],
        "position": [
          0,
          3,
        ],
        "type": "instruction",
      },
    ]
  `);
});

it("registers", () => {
  expect(parse("POP IP")).toMatchInlineSnapshot(`
    [
      {
        "instruction": "POP",
        "label": null,
        "operands": [
          {
            "position": [
              4,
              6,
            ],
            "type": "register",
            "value": "IP",
          },
        ],
        "position": [
          0,
          3,
        ],
        "type": "instruction",
      },
    ]
  `);
  expect(parse("POP BX")).toMatchInlineSnapshot(`
    [
      {
        "instruction": "POP",
        "label": null,
        "operands": [
          {
            "position": [
              4,
              6,
            ],
            "type": "register",
            "value": "BX",
          },
        ],
        "position": [
          0,
          3,
        ],
        "type": "instruction",
      },
    ]
  `);
  expect(parse("POP al")).toMatchInlineSnapshot(`
    [
      {
        "instruction": "POP",
        "label": null,
        "operands": [
          {
            "position": [
              4,
              6,
            ],
            "type": "register",
            "value": "AL",
          },
        ],
        "position": [
          0,
          3,
        ],
        "type": "instruction",
      },
    ]
  `);
  expect(() => parse("POP a l")).toThrowErrorMatchingInlineSnapshot(`
    LineError {
      "code": "custom",
      "from": 6,
      "params": [
        {
          "en": "Expected end of statement.",
        },
      ],
      "to": 7,
    }
  `);
  expect(() => parse("POP BYTE PTR AX")).toThrowErrorMatchingInlineSnapshot(`
    LineError {
      "code": "custom",
      "from": 13,
      "params": [
        {
          "en": "Expected \\"[\\" after \\"BYTE PTR\\".",
        },
      ],
      "to": 15,
    }
  `);
});

describe("Direct address", () => {
  it("auto", () => {
    expect(parse("INC [10h]")).toMatchInlineSnapshot(`
      [
        {
          "instruction": "INC",
          "label": null,
          "operands": [
            {
              "mode": "direct",
              "position": [
                4,
                9,
              ],
              "size": "auto",
              "type": "address",
              "value": {
                "position": [
                  5,
                  8,
                ],
                "type": "number-literal",
                "value": 16,
              },
            },
          ],
          "position": [
            0,
            3,
          ],
          "type": "instruction",
        },
      ]
    `);
  });

  it("byte", () => {
    expect(() => parse("INC BYTE [10h]")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 9,
        "params": [
          {
            "en": "Expected \\"PTR\\" after \\"BYTE\\".",
          },
        ],
        "to": 10,
      }
    `);
    expect(parse("INC BYTE PTR [10h]")).toMatchInlineSnapshot(`
      [
        {
          "instruction": "INC",
          "label": null,
          "operands": [
            {
              "mode": "direct",
              "position": [
                4,
                18,
              ],
              "size": "byte",
              "type": "address",
              "value": {
                "position": [
                  14,
                  17,
                ],
                "type": "number-literal",
                "value": 16,
              },
            },
          ],
          "position": [
            0,
            3,
          ],
          "type": "instruction",
        },
      ]
    `);
  });

  it("word", () => {
    expect(() => parse("INC WORD [10h]")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 9,
        "params": [
          {
            "en": "Expected \\"PTR\\" after \\"WORD\\".",
          },
        ],
        "to": 10,
      }
    `);
    expect(parse("INC WORD PTR [10h]")).toMatchInlineSnapshot(`
      [
        {
          "instruction": "INC",
          "label": null,
          "operands": [
            {
              "mode": "direct",
              "position": [
                4,
                18,
              ],
              "size": "word",
              "type": "address",
              "value": {
                "position": [
                  14,
                  17,
                ],
                "type": "number-literal",
                "value": 16,
              },
            },
          ],
          "position": [
            0,
            3,
          ],
          "type": "instruction",
        },
      ]
    `);
  });

  it("expression", () => {
    expect(() => parse("INC [2 * (3 + OFFSET label)")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 27,
        "params": [
          {
            "en": "Expected \\"]\\" after expression.",
          },
        ],
        "to": 27,
      }
    `);
    expect(parse("INC [2 * (3 + OFFSET label)]")).toMatchInlineSnapshot(`
      [
        {
          "instruction": "INC",
          "label": null,
          "operands": [
            {
              "mode": "direct",
              "position": [
                4,
                28,
              ],
              "size": "auto",
              "type": "address",
              "value": {
                "left": {
                  "position": [
                    5,
                    6,
                  ],
                  "type": "number-literal",
                  "value": 2,
                },
                "operator": "*",
                "position": [
                  5,
                  27,
                ],
                "right": {
                  "left": {
                    "position": [
                      10,
                      11,
                    ],
                    "type": "number-literal",
                    "value": 3,
                  },
                  "operator": "+",
                  "position": [
                    9,
                    27,
                  ],
                  "right": {
                    "offset": true,
                    "position": [
                      14,
                      26,
                    ],
                    "type": "label",
                    "value": "LABEL",
                  },
                  "type": "binary-operation",
                },
                "type": "binary-operation",
              },
            },
          ],
          "position": [
            0,
            3,
          ],
          "type": "instruction",
        },
      ]
    `);
  });
});

describe("Direct address", () => {
  it("auto", () => {
    expect(parse("INC [BX]")).toMatchInlineSnapshot(`
      [
        {
          "instruction": "INC",
          "label": null,
          "operands": [
            {
              "mode": "indirect",
              "position": [
                4,
                8,
              ],
              "size": "auto",
              "type": "address",
            },
          ],
          "position": [
            0,
            3,
          ],
          "type": "instruction",
        },
      ]
    `);
  });

  it("byte", () => {
    expect(() => parse("INC BYTE [BX]")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 9,
        "params": [
          {
            "en": "Expected \\"PTR\\" after \\"BYTE\\".",
          },
        ],
        "to": 10,
      }
    `);
    expect(parse("INC BYTE PTR [BX]")).toMatchInlineSnapshot(`
      [
        {
          "instruction": "INC",
          "label": null,
          "operands": [
            {
              "mode": "indirect",
              "position": [
                4,
                17,
              ],
              "size": "byte",
              "type": "address",
            },
          ],
          "position": [
            0,
            3,
          ],
          "type": "instruction",
        },
      ]
    `);
  });

  it("word", () => {
    expect(() => parse("INC WORD [BX]")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 9,
        "params": [
          {
            "en": "Expected \\"PTR\\" after \\"WORD\\".",
          },
        ],
        "to": 10,
      }
    `);
    expect(parse("INC WORD PTR [BX]")).toMatchInlineSnapshot(`
      [
        {
          "instruction": "INC",
          "label": null,
          "operands": [
            {
              "mode": "indirect",
              "position": [
                4,
                17,
              ],
              "size": "word",
              "type": "address",
            },
          ],
          "position": [
            0,
            3,
          ],
          "type": "instruction",
        },
      ]
    `);
  });

  it("no offset", () => {
    expect(() => parse("INC [BX + 1]")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "custom",
        "from": 8,
        "params": [
          {
            "en": "Expected \\"]\\" after \\"BX\\".",
          },
        ],
        "to": 9,
      }
    `);
  });

  it("only BX", () => {
    expect(parse("INC [   bx  ]")).toMatchInlineSnapshot(`
      [
        {
          "instruction": "INC",
          "label": null,
          "operands": [
            {
              "mode": "indirect",
              "position": [
                4,
                13,
              ],
              "size": "auto",
              "type": "address",
            },
          ],
          "position": [
            0,
            3,
          ],
          "type": "instruction",
        },
      ]
    `);
    expect(() => parse("INC [AX]")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "expected-argument",
        "from": 5,
        "params": [],
        "to": 7,
      }
    `);
    expect(() => parse("INC [IP]")).toThrowErrorMatchingInlineSnapshot(`
      LineError {
        "code": "expected-argument",
        "from": 5,
        "params": [],
        "to": 7,
      }
    `);
  });
});

it("immediate", () => {
  expect(parse("INC 1")).toMatchInlineSnapshot(`
    [
      {
        "instruction": "INC",
        "label": null,
        "operands": [
          {
            "position": [
              4,
              5,
            ],
            "type": "number-literal",
            "value": 1,
          },
        ],
        "position": [
          0,
          3,
        ],
        "type": "instruction",
      },
    ]
  `);
  expect(parse("ADD OFFSET label, 3*4")).toMatchInlineSnapshot(`
    [
      {
        "instruction": "ADD",
        "label": null,
        "operands": [
          {
            "offset": true,
            "position": [
              4,
              16,
            ],
            "type": "label",
            "value": "LABEL",
          },
          {
            "left": {
              "position": [
                18,
                19,
              ],
              "type": "number-literal",
              "value": 3,
            },
            "operator": "*",
            "position": [
              18,
              21,
            ],
            "right": {
              "position": [
                20,
                21,
              ],
              "type": "number-literal",
              "value": 4,
            },
            "type": "binary-operation",
          },
        ],
        "position": [
          0,
          3,
        ],
        "type": "instruction",
      },
    ]
  `);
  expect(() => parse("ADD OFFSET label + (1, BX)")).toThrowErrorMatchingInlineSnapshot(`
    LineError {
      "code": "custom",
      "from": 21,
      "params": [
        {
          "en": "Unclosed parenthesis.",
        },
      ],
      "to": 22,
    }
  `);
});
