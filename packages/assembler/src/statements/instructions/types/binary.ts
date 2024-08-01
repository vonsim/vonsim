import { MemoryAddress } from "@vonsim/common/address";
import { AnyByte, Byte, ByteSize } from "@vonsim/common/byte";
import type { Position } from "@vonsim/common/position";

import { AssemblerError } from "../../../error";
import type { GlobalStore } from "../../../global-store";
import { NumberExpression } from "../../../number-expression";
import type { ByteRegister, Register, WordRegister } from "../../../types";
import { registerToBits } from "../encoding";
import type { Operand } from "../operands";
import { InstructionStatement } from "../statement";

type BinaryInstructionName = "MOV" | "ADD" | "ADC" | "SUB" | "SBB" | "CMP" | "AND" | "OR" | "XOR";

type InitialMemoryAccess = { mode: "direct"; address: NumberExpression } | { mode: "indirect" };

type InitialOperation =
  | { mode: "reg<-reg"; size: ByteSize; out: Register; src: Register }
  | { mode: "reg<-mem"; size: ByteSize; out: Register; src: InitialMemoryAccess }
  | { mode: "reg<-imd"; size: ByteSize; out: Register; src: NumberExpression }
  | { mode: "mem<-reg"; size: ByteSize; out: InitialMemoryAccess; src: Register }
  | { mode: "mem<-imd"; size: ByteSize; out: InitialMemoryAccess; src: NumberExpression };

type MemoryAccess = { mode: "direct"; address: MemoryAddress } | { mode: "indirect" };

type Operation =
  | { mode: "reg<-reg"; size: 8; out: ByteRegister; src: ByteRegister }
  | { mode: "reg<-reg"; size: 16; out: WordRegister; src: WordRegister }
  | { mode: "reg<-mem"; size: 8; out: ByteRegister; src: MemoryAccess }
  | { mode: "reg<-mem"; size: 16; out: WordRegister; src: MemoryAccess }
  | { mode: "reg<-imd"; size: 8; out: ByteRegister; src: Byte<8> }
  | { mode: "reg<-imd"; size: 16; out: WordRegister; src: Byte<16> }
  | { mode: "mem<-reg"; size: 8; out: MemoryAccess; src: ByteRegister }
  | { mode: "mem<-reg"; size: 16; out: MemoryAccess; src: WordRegister }
  | { mode: "mem<-imd"; size: 8; out: MemoryAccess; src: Byte<8> }
  | { mode: "mem<-imd"; size: 16; out: MemoryAccess; src: Byte<16> };

/**
 * BinaryInstruction:
 * - {@link https://vonsim.github.io/en/computer/instructions/mov | MOV}
 * - {@link https://vonsim.github.io/en/computer/instructions/add | ADD}
 * - {@link https://vonsim.github.io/en/computer/instructions/adc | ADC}
 * - {@link https://vonsim.github.io/en/computer/instructions/sub | SUB}
 * - {@link https://vonsim.github.io/en/computer/instructions/sbb | SBB}
 * - {@link https://vonsim.github.io/en/computer/instructions/cmp | CMP}
 * - {@link https://vonsim.github.io/en/computer/instructions/and | AND}
 * - {@link https://vonsim.github.io/en/computer/instructions/or | OR}
 * - {@link https://vonsim.github.io/en/computer/instructions/xor | XOR}
 *
 * These instructions need two operands:
 * - `out`: the destination operand (left operand)
 * - `src`: the source operand (right operand)
 *
 * These operands can be:
 * - both registers (reg<-reg)
 * - a register and a memory address (reg<-mem)
 * - a register and an immediate value (reg<-imd)
 * - a memory address and a register (mem<-reg)
 * - a memory address and an immediate value (mem<-imd)
 *
 * This can't happen:
 * - both memory addresses (mem<-mem)
 * - immediate value on the left (imd<-xxx)
 *
 * Operands need to be of the same size!
 *
 * ---
 * This class is: MUTABLE
 */
export class BinaryInstruction extends InstructionStatement {
  #initialOperation: InitialOperation | null = null;
  #operation: Operation | null = null;

  constructor(
    readonly instruction: BinaryInstructionName,
    operands: Operand[],
    label: string | null,
    position: Position,
  ) {
    super(operands, label, position);
  }

  /**
   * Returns the length of the instruction in bytes.
   * @see https://vonsim.github.io/en/reference/codification
   */
  get length(): number {
    if (!this.#initialOperation) throw new Error("Instruction not validated");
    const { mode, size, out, src } = this.#initialOperation;

    // opcode + mode
    let length = 2;
    if (
      (mode === "reg<-mem" && src.mode === "direct") ||
      ((mode === "mem<-reg" || mode === "mem<-imd") && out.mode === "direct")
    ) {
      length += 2; // 2-byte address
    }
    if (mode === "reg<-imd" || mode === "mem<-imd") {
      length += size / 8; // imd size
    }

    return length;
  }

  get operation(): Operation {
    if (!this.#operation) throw new Error("Instruction not evaluated");

    return this.#operation;
  }

  /**
   * Returns the bytes of the instruction.
   * @see https://vonsim.github.io/en/reference/codification
   */
  toBytes(): Uint8Array {
    const { mode, size, out, src } = this.operation;
    const bytes: number[] = [];

    const opcodes: { [key in BinaryInstructionName]: number } = {
      MOV: 0b100_0000_0,
      AND: 0b100_0001_0,
      OR: 0b100_0010_0,
      XOR: 0b100_0011_0,
      ADD: 0b100_0100_0,
      ADC: 0b100_0101_0,
      SUB: 0b100_0110_0,
      SBB: 0b100_0111_0,
      CMP: 0b100_1000_0,
    };
    bytes[0] = opcodes[this.instruction];

    if (size === 16) bytes[0] |= 1;

    switch (mode) {
      case "reg<-reg": {
        bytes[1] = 0b00_000_000; // 00RRRrrr
        bytes[1] |= registerToBits(src) << 3;
        bytes[1] |= registerToBits(out) << 0;
        break;
      }

      case "reg<-mem": {
        if (src.mode === "direct") {
          bytes[1] = 0b01000_000; // 01000rrr
          bytes.push(src.address.byte.low.unsigned);
          bytes.push(src.address.byte.high.unsigned);
        } else {
          bytes[1] = 0b01010_000; // 01010rrr
        }
        bytes[1] |= registerToBits(out) << 0;
        break;
      }

      case "reg<-imd": {
        bytes[1] = 0b01001_000; // 01001rrr
        bytes[1] |= registerToBits(out) << 0;
        bytes.push(src.low.unsigned);
        if (size === 16) bytes.push(src.high.unsigned);
        break;
      }

      case "mem<-reg": {
        if (out.mode === "direct") {
          bytes[1] = 0b11000_000; // 11000rrr
          bytes.push(out.address.byte.low.unsigned);
          bytes.push(out.address.byte.high.unsigned);
        } else {
          bytes[1] = 0b11010_000; // 11010rrr
        }
        bytes[1] |= registerToBits(src) << 0;
        break;
      }

      case "mem<-imd": {
        if (out.mode === "direct") {
          bytes[1] = 0b11001000;
          bytes.push(out.address.byte.low.unsigned);
          bytes.push(out.address.byte.high.unsigned);
        } else {
          bytes[1] = 0b11011000;
        }
        bytes.push(src.low.unsigned);
        if (size === 16) bytes.push(src.high.unsigned);
        break;
      }

      default: {
        const _exhaustiveCheck: never = mode;
        return _exhaustiveCheck;
      }
    }
    return new Uint8Array(bytes);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.#operation ??
        this.#initialOperation ?? { operands: this.operands.map(o => o.toJSON()) }),
    };
  }

  validate(store: GlobalStore) {
    if (this.#initialOperation) throw new Error("Instruction already validated");

    if (this.operands.length !== 2) {
      throw new AssemblerError("expects-two-operands").at(this);
    }

    const [out, src] = this.operands;

    if (out.isRegister()) {
      // The first operand a register, so this will be
      // reg <- reg
      // reg <- mem
      // reg <- imd

      if (src.isRegister()) {
        if (out.size !== src.size) {
          throw new AssemblerError("size-mismatch", src.size, out.size).at(this);
        }

        this.#initialOperation = {
          mode: "reg<-reg",
          size: out.size,
          out: out.value,
          src: src.value,
        };
        return;
      }

      if (src.isDirectAddress()) {
        if (src.size !== "auto" && src.size !== out.size) {
          throw new AssemblerError("size-mismatch", src.size, out.size).at(this);
        }

        this.#initialOperation = {
          mode: "reg<-mem",
          size: out.size,
          out: out.value,
          src: { mode: "direct", address: src.value },
        };
        return;
      }

      if (src.isIndirectAddress()) {
        if (src.size !== "auto" && src.size !== out.size) {
          throw new AssemblerError("size-mismatch", src.size, out.size).at(this);
        }

        this.#initialOperation = {
          mode: "reg<-mem",
          size: out.size,
          out: out.value,
          src: { mode: "indirect" },
        };
        return;
      }

      // src is NumberExpression

      const directAddress = src.getAsDirectAddress(store);
      if (directAddress) {
        // Is a direct address to a data directive pointed by a label,
        // like `mov al, dataLabel` or `mov al, dataLabel + 1`

        // Check if the size of the data directive pointed is the same as the size of the register
        if (directAddress.size !== out.size) {
          throw new AssemblerError("size-mismatch", directAddress.size, out.size).at(this);
        }

        this.#initialOperation = {
          mode: "reg<-mem",
          size: out.size,
          out: out.value,
          src: {
            mode: "direct",
            // Since doing `mov al, dataLabel` is equivalent to `mov al, [OFFSET dataLabel]`,
            // we'll set the address to the returned expression
            address: directAddress.expression,
          },
        };
        return;
      }

      this.#initialOperation = {
        mode: "reg<-imd",
        size: out.size,
        out: out.value,
        src: src.value,
      };
      return;
    } else {
      // Since the first operand is not a register, this will be
      // mem <- reg
      // mem <- imd
      let size: ByteSize | "auto";
      let address: InitialMemoryAccess;

      if (out.isIndirectAddress()) {
        size = out.size;
        address = { mode: "indirect" };
      } else if (out.isDirectAddress()) {
        size = out.size;
        address = { mode: "direct", address: out.value };
      } else {
        // out is NumberExpression

        const directAddress = out.getAsDirectAddress(store);
        if (directAddress) {
          // Is a direct address to a data directive pointed by a label,
          // like `mov dataLabel, al` or `mov dataLabel + 1, al`

          size = directAddress.size;
          address = {
            mode: "direct",
            // Since doing `mov dataLabel, al` is equivalent to `mov [OFFSET dataLabel], al`,
            // we'll set the address to the returned expression
            address: directAddress.expression,
          };
        } else {
          throw new AssemblerError("destination-cannot-be-immediate").at(out);
        }
      }

      if (src.isRegister()) {
        if (size !== "auto" && size !== src.size) {
          throw new AssemblerError("size-mismatch", size, src.size).at(this);
        }

        this.#initialOperation = {
          mode: "mem<-reg",
          size: src.size,
          out: address,
          src: src.value,
        };
        return;
      }

      if (src.isNumberExpression()) {
        if (src.getAsDirectAddress(store)) {
          // Is a direct address to a data directive pointed by a label, like `mov mem1, mem2`
          throw new AssemblerError("double-memory-access").at(this);
        }

        if (size === "auto") {
          throw new AssemblerError("unknown-size").at(out);
        }

        this.#initialOperation = {
          mode: "mem<-imd",
          size,
          out: address,
          src: src.value,
        };
        return;
      }

      // src is either direct or indirect address
      throw new AssemblerError("double-memory-access").at(this);
    }
  }

  evaluateExpressions(store: GlobalStore) {
    if (!this.#initialOperation) throw new Error("Instruction not validated");
    if (this.#operation) throw new Error("Instruction aready evaluated");

    const { mode, size, out, src } = this.#initialOperation;

    const evaluateAddress = (expr: NumberExpression): MemoryAddress => {
      const computed = expr.evaluate(store);
      if (!MemoryAddress.inRange(computed)) {
        throw new AssemblerError("address-out-of-range", computed).at(expr);
      }

      const address = MemoryAddress.from(computed);
      if (store.addressIsReserved(address)) {
        throw new AssemblerError("address-has-code", address).at(expr);
      }

      return address;
    };

    switch (mode) {
      case "reg<-reg": {
        this.#operation = { mode, size, out, src } as Operation;
        return;
      }

      case "reg<-mem": {
        this.#operation = {
          mode,
          size,
          out,
          src:
            src.mode === "direct"
              ? { mode: "direct", address: evaluateAddress(src.address) }
              : { mode: "indirect" },
        } as Operation;
        return;
      }

      case "reg<-imd": {
        const computed = src.evaluate(store);
        if (!Byte.fits(computed, size)) {
          throw new AssemblerError("value-out-of-range", computed, size).at(src);
        }
        const byte = Byte.fromNumber(computed, size) as AnyByte;
        this.#operation = { mode, size, out, src: byte } as Operation;
        return;
      }

      case "mem<-reg": {
        this.#operation = {
          mode,
          size,
          out:
            out.mode === "direct"
              ? { mode: "direct", address: evaluateAddress(out.address) }
              : { mode: "indirect" },
          src,
        } as Operation;
        return;
      }

      case "mem<-imd": {
        const computed = src.evaluate(store);
        if (!Byte.fits(computed, size)) {
          throw new AssemblerError("value-out-of-range", computed, size).at(src);
        }
        const byte = Byte.fromNumber(computed, size) as AnyByte;

        this.#operation = {
          mode,
          size,
          out:
            out.mode === "direct"
              ? { mode: "direct", address: evaluateAddress(out.address) }
              : { mode: "indirect" },
          src: byte,
        } as Operation;
        return;
      }

      default: {
        const _exhaustiveCheck: never = mode;
        return _exhaustiveCheck;
      }
    }
  }
}
