import { match } from "ts-pattern";

import { MAX_VALUE, Size } from "@/config";
import { bit } from "@/helpers";
import type { Jsonable } from "@/simulator/common";

export type ArithmeticOperation = "ADD" | "ADC" | "SUB" | "SBB";
export type LogicalOperation = "AND" | "OR" | "XOR" | "NOT";
export type Operation = ArithmeticOperation | LogicalOperation;
export type Flags = { carry: boolean; overflow: boolean; sign: boolean; zero: boolean };

export class ALU implements Jsonable {
  #left = 0;
  #right = 0;
  #result = 0;
  #operation: Operation = "ADD";
  #flags: Flags = { carry: false, overflow: false, sign: false, zero: false };

  get flags() {
    return structuredClone(this.#flags);
  }

  execute(operation: Operation, left: number, right: number, size: Size): number {
    this.#left = left;
    this.#right = right;
    this.#operation = operation;

    if ((["ADD", "ADC", "SUB", "SBB"] as const).includes(operation)) {
      return this.#arithmetic(operation, size);
    } else {
      return this.#logical(operation, size);
    }
  }

  #arithmetic(operation: ArithmeticOperation, size: Size): number {
    this.#result = match(operation)
      .with("ADD", () => this.#left + this.#right)
      .with("ADC", () => this.#left + this.#right + Number(this.#flags.carry))
      .with("SUB", () => this.#left - this.#right)
      .with("SBB", () => this.#left - this.#right - Number(this.#flags.carry))
      .exhaustive();

    this.#flags = { carry: false, overflow: false, sign: false, zero: false };

    if (this.#result > MAX_VALUE[size]) {
      // overflow
      this.#flags.carry = true;
      this.#result -= MAX_VALUE[size] + 1;
    } else if (this.#result < 0) {
      // underflow
      this.#flags.carry = true;
      this.#result += MAX_VALUE[size] + 1;
    }

    const signBit = size === "byte" ? 7 : 15;
    const leftSign = bit(this.#left, signBit);
    const rightSign = bit(this.#right, signBit);
    const resultSign = bit(this.#result, signBit);

    if (operation === "ADD" || operation === "ADC") {
      // When adding, the overflow flag is set if
      // - the sum of two positive numbers is negative, or
      // - the sum of two negative numbers is positive.
      this.#flags.overflow = leftSign === rightSign && leftSign !== resultSign;
    } else {
      // When subtracting, the overflow flag is set if
      // - a positive number minus a negative number is negative, or
      // - a negative number minus a positive number is positive.
      this.#flags.overflow = leftSign !== rightSign && rightSign === resultSign;
    }

    this.#flags.sign = resultSign;
    this.#flags.zero = this.#result === 0;

    return this.#result;
  }

  #logical(operation: LogicalOperation, size: Size): number {
    this.#result = match(operation)
      .with("AND", () => this.#left & this.#right)
      .with("OR", () => this.#left | this.#right)
      .with("XOR", () => this.#left ^ this.#right)
      .with("NOT", () => ~this.#right)
      .exhaustive();

    this.#flags = {
      carry: false,
      overflow: false,
      sign: bit(this.#result, size === "byte" ? 7 : 15),
      zero: this.#result === 0,
    };

    return this.#result;
  }

  encodeFlags(): number {
    let bits = 0b0000;
    if (this.#flags.carry) bits |= 0b0001;
    if (this.#flags.overflow) bits |= 0b0010;
    if (this.#flags.sign) bits |= 0b0100;
    if (this.#flags.zero) bits |= 0b1000;
    return bits;
  }

  decodeFlags(bits: number) {
    this.#flags = {
      carry: bit(bits, 0),
      overflow: bit(bits, 1),
      sign: bit(bits, 2),
      zero: bit(bits, 3),
    };
  }

  toJSON() {
    return {
      left: this.#left,
      right: this.#right,
      result: this.#result,
      operation: this.#operation,
      flags: this.flags,
    };
  }
}
