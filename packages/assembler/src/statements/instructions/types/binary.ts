import { MemoryAddress } from "@vonsim/common/address";
import { AnyByte, Byte, ByteSize } from "@vonsim/common/byte";

import { CompilerError } from "../../../error";
import type { GlobalStore } from "../../../global-store";
import { NumberExpression } from "../../../number-expression";
import type { Position } from "../../../position";
import type { ByteRegister, Register, WordRegister } from "../../../types";
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
 * MOV, ADD, ADC, SUB, SBB, CMP, AND, OR, XOR
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
   * @see /docs/especificaciones/codificacion.md
   */
  get length(): number {
    if (!this.#initialOperation) throw new Error("Instruction not validated");
    const { mode, size } = this.#initialOperation;

    // opcode + mode
    let length = 2;
    if (mode === "reg<-mem" || mode === "mem<-reg" || mode === "mem<-imd") {
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
      throw new CompilerError("expects-two-operands").at(this);
    }

    const [out, src] = this.operands;

    if (out.isRegister()) {
      // The first operand a register, so this will be
      // reg <- reg
      // reg <- mem
      // reg <- imd

      if (src.isRegister()) {
        if (out.size !== src.size) {
          throw new CompilerError("size-mismatch", src.size, out.size).at(this);
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
          throw new CompilerError("size-mismatch", src.size, out.size).at(this);
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
          throw new CompilerError("size-mismatch", src.size, out.size).at(this);
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

      if (src.value.isLabel()) {
        // ^ This check is primarily for type-safety

        const srcSize = src.isDataDirectiveLabel(store);
        if (srcSize) {
          // Is a data label, like `mov al, dataLabel`

          // It needs to check if the size of the data label is the same as the size of the register
          if (srcSize !== out.size) {
            throw new CompilerError("size-mismatch", srcSize, out.size).at(this);
          }

          this.#initialOperation = {
            mode: "reg<-mem",
            size: out.size,
            out: out.value,
            src: {
              mode: "direct",
              // Since doing `mov al, dataLabel` is equivalent to `mov al, [OFFSET dataLabel]`,
              // we'll transform the data label into an offset expression
              address: NumberExpression.label(src.value.value, true, src.value.position),
            },
          };
          return;
        }
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

        if (out.value.isLabel()) {
          // Could be a data label, like `mov dest, al`
          size = out.isDataDirectiveLabel(store) || "auto";
          if (size === "auto") {
            // If the size is auto, it means that the label doesn't point to a data directive.
            throw new CompilerError("label-should-be-writable", out.value.value).at(out);
          }
          address = {
            mode: "direct",
            // Since doing `mov dest, al` is equivalent to `mov [OFFSET dest], al`,
            // we'll transform the data label into an offset expression
            address: NumberExpression.label(out.value.value, true, out.value.position),
          };
        } else {
          throw new CompilerError("destination-cannot-be-immediate").at(out);
        }
      }

      if (src.isRegister()) {
        if (size !== "auto" && size !== src.size) {
          throw new CompilerError("size-mismatch", size, src.size).at(this);
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
        if (src.isDataDirectiveLabel(store)) {
          // It's a data label, like `mov mem1, mem2`
          throw new CompilerError("double-memory-access").at(this);
        }

        if (size === "auto") {
          throw new CompilerError("unknown-size").at(out);
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
      throw new CompilerError("double-memory-access").at(this);
    }
  }

  evaluateExpressions(store: GlobalStore) {
    if (!this.#initialOperation) throw new Error("Instruction not validated");
    if (this.#operation) throw new Error("Instruction aready evaluated");

    const { mode, size, out, src } = this.#initialOperation;

    const evaluateAddress = (expr: NumberExpression): MemoryAddress => {
      const computed = expr.evaluate(store);
      if (!MemoryAddress.inRange(computed)) {
        throw new CompilerError("address-out-of-range", computed).at(expr);
      }

      const address = MemoryAddress.from(computed);
      if (store.addressIsReserved(address)) {
        throw new CompilerError("address-has-code", address).at(expr);
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
          throw new CompilerError("value-out-of-range", computed, size).at(src);
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
          throw new CompilerError("value-out-of-range", computed, size).at(src);
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
