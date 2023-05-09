import { describe, expect, it } from "vitest";

import * as helpers from "@/helpers";

it("joinLowHigh", () => {
  expect(helpers.joinLowHigh(0x12, 0x34)).toBe(0x3412);
});

it("splitLowHigh", () => {
  expect(helpers.splitLowHigh(0x3412)).toEqual([0x12, 0x34]);
});

it("bit", () => {
  expect(helpers.bit(0x12, 0)).toBe(false);
  expect(helpers.bit(0x12, 1)).toBe(true);
  expect(helpers.bit(0x12, 2)).toBe(false);
  expect(helpers.bit(0x12, 3)).toBe(false);
  expect(helpers.bit(0x12, 4)).toBe(true);
  expect(helpers.bit(0x12, 5)).toBe(false);
  expect(helpers.bit(0x12, 6)).toBe(false);
  expect(helpers.bit(0x12, 7)).toBe(false);
});

describe("binaryToSignedInt", () => {
  it("byte", () => {
    expect(helpers.binaryToSignedInt(0x00, "byte")).toBe(0x00);
    expect(helpers.binaryToSignedInt(0x7f, "byte")).toBe(0x7f);
    expect(helpers.binaryToSignedInt(0x80, "byte")).toBe(-0x80);
    expect(helpers.binaryToSignedInt(0xff, "byte")).toBe(-0x01);
  });

  it("word", () => {
    expect(helpers.binaryToSignedInt(0x0000, "word")).toBe(0x0000);
    expect(helpers.binaryToSignedInt(0x7fff, "word")).toBe(0x7fff);
    expect(helpers.binaryToSignedInt(0x8000, "word")).toBe(-0x8000);
    expect(helpers.binaryToSignedInt(0xffff, "word")).toBe(-0x0001);
  });
});

describe("signedIntToBinary", () => {
  it("byte", () => {
    expect(helpers.signedIntToBinary(0x00, "byte")).toBe(0x00);
    expect(helpers.signedIntToBinary(0x7f, "byte")).toBe(0x7f);
    expect(helpers.signedIntToBinary(-0x80, "byte")).toBe(0x80);
    expect(helpers.signedIntToBinary(-0x01, "byte")).toBe(0xff);
  });

  it("word", () => {
    expect(helpers.signedIntToBinary(0x0000, "word")).toBe(0x0000);
    expect(helpers.signedIntToBinary(0x7fff, "word")).toBe(0x7fff);
    expect(helpers.signedIntToBinary(-0x8000, "word")).toBe(0x8000);
    expect(helpers.signedIntToBinary(-0x0001, "word")).toBe(0xffff);
  });
});
