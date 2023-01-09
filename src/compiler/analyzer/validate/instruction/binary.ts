import { isMatching, match } from "ts-pattern";
import type { Merge } from "type-fest";
import { BinaryInstructionType, LineError, RegisterType } from "~/compiler/common";
import { wordRegisterPattern } from "~/compiler/common/patterns";
import {
  InstructionStatement,
  NumberExpression,
  numberExpressionPattern,
  Operand,
} from "~/compiler/parser/grammar";
import type { Size } from "~/config";
import type { LabelTypes } from "../../get-label-types";
import type { ValidatedMeta } from "../types";

type RegisterOperand = { type: "register"; register: RegisterType };
type MemoryOperand = { type: "memory" } & (
  | { mode: "direct"; address: NumberExpression }
  | { mode: "indirect" }
);
type ImmediateOperand = { type: "immediate"; value: NumberExpression };

export type ValidatedBinaryInstruction = {
  type: BinaryInstructionType;
  meta: ValidatedMeta;
  opSize: Size;
  out: RegisterOperand | MemoryOperand;
  src: RegisterOperand | MemoryOperand | ImmediateOperand;
};

/**
 * Validates a binary instruction.
 *
 * The parser returns a generic instruction statement, with operands that can be
 * - a register (`AX`, `BL`, etc...)
 * - an address, that can be
 *   - direct (`[1234h]`, `[OFFSET dataLabel]`, `[instruction_label]` etc...)
 *     its value is always an expression that can be calculated at compile time
 *   - indirect (`[BX]`)
 * - an immediate value (`1234h`, `OFFSET dataLabel`, `instruction_label` etc...)
 *   its value is always an expression that can be calculated at compile time
 * - a data label (`dataLabel`)
 *   it's a special case of an immediate value, quasi-equivalent to `[OFFSET dataLabel]`
 *   although it isn't an expression, it comes from the parser as an expression
 *   with just one label
 *
 * Notice that both immediate values and data labels are expressions can be
 * expression with just one label, so we need to distinguish them.
 */

export function validateBinaryInstruction(
  instruction: Merge<InstructionStatement, { instruction: BinaryInstructionType }>,
  labels: LabelTypes,
): ValidatedBinaryInstruction {
  if (instruction.operands.length !== 2) {
    throw new LineError("expects-two-operands", ...instruction.position);
  }

  return match<[Operand, Operand], ValidatedBinaryInstruction>(
    instruction.operands as [Operand, Operand],
  )
    .with([{ type: "register" }, { type: "register" }], ([out, src]) => {
      const outReg = typeGuardRegister(out);
      const srcReg = typeGuardRegister(src);

      if (outReg.size !== srcReg.size) {
        throw new LineError("size-mismatch", srcReg.size, outReg.size, ...instruction.position);
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 3, position: instruction.position },
        opSize: outReg.size,
        out: { type: "register", register: outReg.value },
        src: { type: "register", register: srcReg.value },
      };
    })
    .with([{ type: "register" }, { type: "address", mode: "direct" }], ([out, src]) => {
      const outReg = typeGuardRegister(out);
      if (src.size !== "auto" && outReg.size !== src.size) {
        throw new LineError("size-mismatch", src.size, outReg.size, ...instruction.position);
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 4, position: instruction.position },
        opSize: outReg.size,
        out: { type: "register", register: outReg.value },
        src: { type: "memory", mode: "direct", address: src.value },
      };
    })
    .with([{ type: "register" }, { type: "address", mode: "indirect" }], ([out, src]) => {
      const outReg = typeGuardRegister(out);
      if (src.size !== "auto" && outReg.size !== src.size) {
        throw new LineError("size-mismatch", src.size, outReg.size, ...instruction.position);
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
        opSize: outReg.size,
        out: { type: "register", register: outReg.value },
        src: { type: "memory", mode: "indirect" },
      };
    })
    .with([{ type: "register" }, numberExpressionPattern], ([out, src]) => {
      const outReg = typeGuardRegister(out);

      // Can be a label pointing to a DB or DW
      if (src.type === "label" && !src.offset) {
        const srcSize = getLabelSize(src, labels);
        if (srcSize) {
          if (outReg.size !== srcSize) {
            throw new LineError("size-mismatch", srcSize, outReg.size, ...instruction.position);
          }

          return {
            type: instruction.instruction,
            meta: { label: instruction.label, start: 0, length: 4, position: instruction.position },
            opSize: outReg.size,
            out: { type: "register", register: outReg.value },
            src: labelToMemoryDirect(src),
          };
        }
      }

      return {
        type: instruction.instruction,
        meta: {
          label: instruction.label,
          start: 0,
          length: 2 + (outReg.size === "word" ? 2 : 1),
          position: instruction.position,
        },
        opSize: outReg.size,
        out: { type: "register", register: outReg.value },
        src: { type: "immediate", value: src },
      };
    })
    .with([{ type: "address", mode: "direct" }, { type: "register" }], ([out, src]) => {
      const srcReg = typeGuardRegister(src);
      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 4, position: instruction.position },
        opSize: srcReg.size,
        out: { type: "memory", mode: "direct", address: out.value },
        src: { type: "register", register: srcReg.value },
      };
    })
    .with([{ type: "address", mode: "indirect" }, { type: "register" }], ([_, src]) => {
      const srcReg = typeGuardRegister(src);
      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
        opSize: srcReg.size,
        out: { type: "memory", mode: "indirect" },
        src: { type: "register", register: srcReg.value },
      };
    })
    .with([{ type: "address", mode: "direct" }, numberExpressionPattern], ([out, src]) => {
      // Can be a label pointing to a DB or DW
      if (src.type === "label" && !src.offset && getLabelSize(src, labels)) {
        throw new LineError("double-memory-access", ...instruction.position);
      }

      if (out.size === "auto") {
        throw new LineError("unknown-size", ...out.position);
      }

      return {
        type: instruction.instruction,
        meta: {
          label: instruction.label,
          start: 0,
          length: 3 + (out.size === "word" ? 2 : 1),
          position: instruction.position,
        },
        opSize: out.size,
        out: { type: "memory", mode: "direct", address: out.value },
        src: { type: "immediate", value: src },
      };
    })
    .with([{ type: "address", mode: "indirect" }, numberExpressionPattern], ([out, src]) => {
      // Can be a label pointing to a DB or DW
      if (src.type === "label" && !src.offset && getLabelSize(src, labels)) {
        throw new LineError("double-memory-access", ...instruction.position);
      }

      if (out.size === "auto") {
        throw new LineError("unknown-size", ...out.position);
      }

      return {
        type: instruction.instruction,
        meta: {
          label: instruction.label,
          start: 0,
          length: 1 + (out.size === "word" ? 2 : 1),
          position: instruction.position,
        },
        opSize: out.size,
        out: { type: "memory", mode: "indirect" },
        src: { type: "immediate", value: src },
      };
    })
    .with([{ type: "address" }, { type: "address" }], () => {
      throw new LineError("double-memory-access", ...instruction.position);
    })
    .with([numberExpressionPattern, { type: "register" }], ([out, src]) => {
      // Could be an immediate value
      if (out.type !== "label" || out.offset) {
        throw new LineError("destination-cannot-be-immediate", ...out.position);
      }

      const outSize = getLabelSize(out, labels);
      if (!outSize) {
        throw new LineError("label-should-be-writable", out.value, ...out.position);
      }

      const srcReg = typeGuardRegister(src);
      if (outSize !== srcReg.size) {
        throw new LineError("size-mismatch", srcReg.size, outSize, ...instruction.position);
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 4, position: instruction.position },
        opSize: outSize,
        out: labelToMemoryDirect(out),
        src: { type: "register", register: srcReg.value },
      };
    })
    .with([numberExpressionPattern, { type: "address" }], ([out]) => {
      if (out.type !== "label" || out.offset || !getLabelSize(out, labels)) {
        throw new LineError("destination-cannot-be-immediate", ...out.position);
      } else {
        throw new LineError("double-memory-access", ...instruction.position);
      }
    })
    .with([numberExpressionPattern, numberExpressionPattern], ([out, src]) => {
      // Could be an immediate value
      if (out.type !== "label" || out.offset) {
        throw new LineError("destination-cannot-be-immediate", ...out.position);
      }

      const outSize = getLabelSize(out, labels);
      if (!outSize) {
        throw new LineError("label-should-be-writable", out.value, ...out.position);
      }

      // Can be a label pointing to a DB or DW
      if (src.type === "label" && !src.offset) {
        const srcSize = getLabelSize(src, labels);
        if (srcSize) {
          throw new LineError("double-memory-access", ...instruction.position);
        }
      }

      return {
        type: instruction.instruction,
        meta: {
          label: instruction.label,
          start: 0,
          length: 3 + (outSize === "word" ? 2 : 1),
          position: instruction.position,
        },
        opSize: outSize,
        out: labelToMemoryDirect(out),
        src: { type: "immediate", value: src },
      };
    })
    .exhaustive();
}

function typeGuardRegister(reg: Extract<Operand, { type: "register" }>) {
  if (isMatching(wordRegisterPattern, reg.value)) {
    return { type: "register", size: "word", value: reg.value, position: reg.position } as const;
  } else {
    return { type: "register", size: "byte", value: reg.value, position: reg.position } as const;
  }
}

/**
 * Returns the size of the data directive, or false if it's an instruction label or a constant.
 */
function getLabelSize(label: Extract<NumberExpression, { type: "label" }>, labels: LabelTypes) {
  const labelType = labels.get(label.value);
  if (!labelType) {
    throw new LineError("label-not-found", label.value, ...label.position);
  }
  return labelType === "DB" ? "byte" : labelType === "DW" ? "word" : false;
}

/**
 * As previously stated, the operand `dataLabel` is essentially `[OFFSET dataLabel]`.
 * For consistency, we convert it to a memory operand with a direct address.
 */

function labelToMemoryDirect({
  value,
  position,
}: Extract<NumberExpression, { type: "label" }>): Extract<MemoryOperand, { mode: "direct" }> {
  return {
    type: "memory",
    mode: "direct",
    address: { type: "label", offset: true, value, position },
  };
}
