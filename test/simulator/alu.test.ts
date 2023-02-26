import { describe, expect, it } from "vitest";

import { binaryToSignedInt, signedIntToBinary } from "@/helpers";
import { ALU, ArithmeticOperation } from "@/simulator/cpu/alu";

describe("byte", () => {
  const alu = new ALU();

  const intOpertarion = (a: number, operation: ArithmeticOperation, b: number) => {
    a = signedIntToBinary(a, "byte");
    b = signedIntToBinary(b, "byte");
    let result = alu.execute(operation, a, b, "byte");
    result = binaryToSignedInt(result, "byte");
    return result;
  };

  it("0+0 = 0 // ___Z", () => {
    const result = intOpertarion(0, "ADD", 0);
    const flags = alu.flags;

    expect(result).toBe(0);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(true);
  });

  it("0-0 = 0 // ___Z", () => {
    const result = intOpertarion(0, "SUB", 0);
    const flags = alu.flags;

    expect(result).toBe(0);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(true);
  });

  it("5+8 = 13 // ____", () => {
    const result = intOpertarion(5, "ADD", 8);
    const flags = alu.flags;

    expect(result).toBe(13);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(false);
  });

  it("5-8 = -3 // C_S_", () => {
    const result = intOpertarion(5, "SUB", 8);
    const flags = alu.flags;

    expect(result).toBe(-3);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(true);
    expect(flags.zero).toBe(false);
  });

  it("5-(-8) = 13 // C___", () => {
    const result = intOpertarion(5, "SUB", -8);
    const flags = alu.flags;

    expect(result).toBe(13);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(false);
  });

  // Positive + Positive = Negative
  it("127+1 = -128 // _OS_", () => {
    const result = intOpertarion(127, "ADD", 1);
    const flags = alu.flags;

    expect(result).toBe(-128);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(true);
    expect(flags.sign).toBe(true);
    expect(flags.zero).toBe(false);
  });

  // Negative + Negative = Positive
  it("(-128)+(-127) = 1 // CO__", () => {
    const result = intOpertarion(-128, "ADD", -127);
    const flags = alu.flags;

    expect(result).toBe(1);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(true);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(false);
  });

  // Positive - Negative = Negative
  it("127-(-1) = -128 // COS_", () => {
    const result = intOpertarion(127, "SUB", -1);
    const flags = alu.flags;

    expect(result).toBe(-128);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(true);
    expect(flags.sign).toBe(true);
    expect(flags.zero).toBe(false);
  });

  // Negative - Positive = Positive
  it("(-128)-1 = 127 // _O__", () => {
    const result = intOpertarion(-128, "SUB", 1);
    const flags = alu.flags;

    expect(result).toBe(127);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(true);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(false);
  });

  it("overflow", () => {
    const result = alu.execute("ADD", 255, 1, "byte");
    const flags = alu.flags;

    expect(result).toBe(0);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(true);
  });

  it("underflow", () => {
    const result = alu.execute("SUB", 0, 1, "byte");
    const flags = alu.flags;

    expect(result).toBe(255);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(true);
    expect(flags.zero).toBe(false);
  });
});

describe("word", () => {
  const alu = new ALU();

  const intOpertarion = (a: number, operation: ArithmeticOperation, b: number) => {
    a = signedIntToBinary(a, "word");
    b = signedIntToBinary(b, "word");
    let result = alu.execute(operation, a, b, "word");
    result = binaryToSignedInt(result, "word");
    return result;
  };

  it("0+0 = 0 // ___Z", () => {
    const result = intOpertarion(0, "ADD", 0);
    const flags = alu.flags;

    expect(result).toBe(0);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(true);
  });

  it("0-0 = 0 // ___Z", () => {
    const result = intOpertarion(0, "SUB", 0);
    const flags = alu.flags;

    expect(result).toBe(0);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(true);
  });

  it("20+400 = 420 // ____", () => {
    const result = intOpertarion(400, "ADD", 20);
    const flags = alu.flags;

    expect(result).toBe(420);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(false);
  });

  it("20-400 = -380 // C_S_", () => {
    const result = intOpertarion(20, "SUB", 400);
    const flags = alu.flags;

    expect(result).toBe(-380);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(true);
    expect(flags.zero).toBe(false);
  });

  it("20-(-400) = 420 // C___", () => {
    const result = intOpertarion(20, "SUB", -400);
    const flags = alu.flags;

    expect(result).toBe(420);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(false);
  });

  // Positive + Positive = Negative
  it("32767+1 = -c // _OS_", () => {
    const result = intOpertarion(32767, "ADD", 1);
    const flags = alu.flags;

    expect(result).toBe(-32768);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(true);
    expect(flags.sign).toBe(true);
    expect(flags.zero).toBe(false);
  });

  // Negative + Negative = Positive
  it("(-32768)+(-32767) = 1 // CO__", () => {
    const result = intOpertarion(-32768, "ADD", -32767);
    const flags = alu.flags;

    expect(result).toBe(1);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(true);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(false);
  });

  // Positive - Negative = Negative
  it("32767-(-1) = -32768 // COS_", () => {
    const result = intOpertarion(32767, "SUB", -1);
    const flags = alu.flags;

    expect(result).toBe(-32768);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(true);
    expect(flags.sign).toBe(true);
    expect(flags.zero).toBe(false);
  });

  // Negative - Positive = Positive
  it("(-32768)-1 = 32767 // _O__", () => {
    const result = intOpertarion(-32768, "SUB", 1);
    const flags = alu.flags;

    expect(result).toBe(32767);
    expect(flags.carry).toBe(false);
    expect(flags.overflow).toBe(true);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(false);
  });

  it("overflow", () => {
    const result = alu.execute("ADD", 65535, 1, "word");
    const flags = alu.flags;

    expect(result).toBe(0);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(false);
    expect(flags.zero).toBe(true);
  });

  it("underflow", () => {
    const result = alu.execute("SUB", 0, 1, "word");
    const flags = alu.flags;

    expect(result).toBe(65535);
    expect(flags.carry).toBe(true);
    expect(flags.overflow).toBe(false);
    expect(flags.sign).toBe(true);
    expect(flags.zero).toBe(false);
  });
});
