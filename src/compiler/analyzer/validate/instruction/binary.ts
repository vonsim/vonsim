import { isMatching, match, P } from "ts-pattern";
import type { Merge } from "type-fest";
import { BinaryInstructionType, CompilerError, RegisterType } from "~/compiler/common";
import { byteRegisterPattern } from "~/compiler/common/patterns";
import type { InstructionStatement, NumberExpression, Operand } from "~/compiler/parser/grammar";
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
  opSize: "byte" | "word";
  out: RegisterOperand | MemoryOperand;
  src: RegisterOperand | MemoryOperand | ImmediateOperand;
};

export function validateBinaryInstruction(
  instruction: Merge<InstructionStatement, { instruction: BinaryInstructionType }>,
  labels: LabelTypes,
): ValidatedBinaryInstruction {
  if (instruction.operands.length !== 2) {
    throw new CompilerError("This instruction expects two operands.", ...instruction.position);
  }

  return match<[Operand, Operand], ValidatedBinaryInstruction>(
    instruction.operands as [Operand, Operand],
  )
    .with([{ type: "immediate" }, P.any], ([out]) => {
      throw new CompilerError("The destination can't be an immediate value.", ...out.position);
    })
    .with([{ type: "register" }, { type: "register" }], ([out, src]) => {
      const outReg = typeGuardRegister(out);
      const srcReg = typeGuardRegister(src);

      if (outReg.size !== srcReg.size) {
        throw new CompilerError(
          `The source (${srcReg.size}) and destination (${outReg.size}) must be the same size.`,
          ...instruction.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 3, position: instruction.position },
        opSize: outReg.size,
        out: { type: "register", register: outReg.value },
        src: { type: "register", register: srcReg.value },
      };
    })
    .with([{ type: "register" }, { type: "label" }], ([out, src]) => {
      const outReg = typeGuardRegister(out);
      const srcType = getLabelType(src, labels);

      if (srcType === "instruction") {
        throw new CompilerError(
          `Label ${src.label} doesn't point to a writable memory address — should point to a DB, DW or EQU declaration.`,
          ...src.position,
        );
      }

      if (srcType === "EQU") {
        return {
          type: instruction.instruction,
          meta: {
            label: instruction.label,
            start: 0,
            length: 2 + outReg.size === "word" ? 2 : 1,
            position: instruction.position,
          },
          opSize: outReg.size,
          out: { type: "register", register: outReg.value },
          src: labelToImmediate(src),
        };
      }

      const srcSize = srcType === "DB" ? "byte" : "word";
      if (outReg.size !== srcSize) {
        throw new CompilerError(
          `The source (${srcSize}) and destination (${outReg.size}) must be the same size.`,
          ...instruction.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 4, position: instruction.position },
        opSize: outReg.size,
        out: { type: "register", register: outReg.value },
        src: labelToMemoryDirect(src),
      };
    })
    .with([{ type: "register" }, { type: "address", mode: "direct" }], ([out, src]) => {
      const outReg = typeGuardRegister(out);
      if (src.size !== "auto" && outReg.size !== src.size) {
        throw new CompilerError(
          `The source (${src.size}) and destination (${outReg.size}) must be the same size.`,
          ...instruction.position,
        );
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
        throw new CompilerError(
          `The source (${src.size}) and destination (${outReg.size}) must be the same size.`,
          ...instruction.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
        opSize: outReg.size,
        out: { type: "register", register: outReg.value },
        src: { type: "memory", mode: "indirect" },
      };
    })
    .with([{ type: "register" }, { type: "immediate" }], ([out, src]) => {
      const outReg = typeGuardRegister(out);
      return {
        type: instruction.instruction,
        meta: {
          label: instruction.label,
          start: 0,
          length: 2 + outReg.size === "word" ? 2 : 1,
          position: instruction.position,
        },
        opSize: outReg.size,
        out: { type: "register", register: outReg.value },
        src: { type: "immediate", value: src.value },
      };
    })
    .with([{ type: "label" }, { type: "register" }], ([out, src]) => {
      const outType = getLabelType(out, labels);
      const srcReg = typeGuardRegister(src);

      const outSize = outType === "DB" ? "byte" : outType === "DW" ? "word" : false;
      if (!outSize) {
        throw new CompilerError(
          `Label ${out.label} doesn't point to a writable memory address — should point to a DB or DW declaration.`,
          ...out.position,
        );
      }

      if (outSize !== srcReg.size) {
        throw new CompilerError(
          `The source (${srcReg.size}) and destination (${outSize}) must be the same size.`,
          ...instruction.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 4, position: instruction.position },
        opSize: outSize,
        out: labelToMemoryDirect(out),
        src: { type: "register", register: srcReg.value },
      };
    })
    .with([{ type: "label" }, { type: "label" }], ([out, src]) => {
      const outType = getLabelType(out, labels);
      const srcType = getLabelType(src, labels);

      const outSize = outType === "DB" ? "byte" : outType === "DW" ? "word" : false;
      if (!outSize) {
        throw new CompilerError(
          `Label ${out.label} doesn't point to a writable memory address — should point to a DB or DW declaration.`,
          ...out.position,
        );
      }

      if (srcType !== "EQU") {
        throw new CompilerError(
          `Label ${src.label} should point to a EQU declaration. Maybe you ment to write OFFSET ${src.label}.`,
          ...out.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: {
          label: instruction.label,
          start: 0,
          length: 3 + outSize === "word" ? 2 : 1,
          position: instruction.position,
        },
        opSize: outSize,
        out: labelToMemoryDirect(out),
        src: labelToImmediate(src),
      };
    })
    .with([{ type: "label" }, { type: "immediate" }], ([out, src]) => {
      const outType = getLabelType(out, labels);

      const outSize = outType === "DB" ? "byte" : outType === "DW" ? "word" : false;
      if (!outSize) {
        throw new CompilerError(
          `Label ${out.label} doesn't point to a writable memory address — should point to a DB or DW declaration.`,
          ...out.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: {
          label: instruction.label,
          start: 0,
          length: 3 + outSize === "word" ? 2 : 1,
          position: instruction.position,
        },
        opSize: outSize,
        out: labelToMemoryDirect(out),
        src: { type: "immediate", value: src.value },
      };
    })
    .with([{ type: "address" }, { type: "register" }], ([out, src]) => {
      const srcReg = typeGuardRegister(src);
      if (out.mode === "direct") {
        return {
          type: instruction.instruction,
          meta: { label: instruction.label, start: 0, length: 4, position: instruction.position },
          opSize: srcReg.size,
          out: { type: "memory", mode: "direct", address: out.value },
          src: { type: "register", register: srcReg.value },
        };
      } else {
        return {
          type: instruction.instruction,
          meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
          opSize: srcReg.size,
          out: { type: "memory", mode: "indirect" },
          src: { type: "register", register: srcReg.value },
        };
      }
    })
    .with([{ type: "address" }, { type: "label" }], ([out, src]) => {
      const srcType = getLabelType(src, labels);

      if (srcType !== "EQU") {
        throw new CompilerError(
          `Label ${src.label} should point to a EQU declaration. Maybe you ment to write OFFSET ${src.label}.`,
          ...out.position,
        );
      }

      if (out.size === "auto") {
        throw new CompilerError(
          "Addressing an unknown memory address with an immediate operand requires specifying the type of pointer with WORD PTR or BYTE PTR before the address.",
          ...out.position,
        );
      }

      if (out.mode === "direct") {
        return {
          type: instruction.instruction,
          meta: {
            label: instruction.label,
            start: 0,
            length: 3 + out.size === "word" ? 2 : 1,
            position: instruction.position,
          },
          opSize: out.size,
          out: { type: "memory", mode: "direct", address: out.value },
          src: labelToImmediate(src),
        };
      } else {
        return {
          type: instruction.instruction,
          meta: {
            label: instruction.label,
            start: 0,
            length: 1 + out.size === "word" ? 2 : 1,
            position: instruction.position,
          },
          opSize: out.size,
          out: { type: "memory", mode: "indirect" },
          src: labelToImmediate(src),
        };
      }
    })
    .with([{ type: "address" }, { type: "immediate" }], ([out, src]) => {
      if (out.size === "auto") {
        throw new CompilerError(
          "Addressing an unknown memory address with an immediate operand requires specifying the type of pointer with WORD PTR or BYTE PTR before the address.",
          ...out.position,
        );
      }

      if (out.mode === "direct") {
        return {
          type: instruction.instruction,
          meta: {
            label: instruction.label,
            start: 0,
            length: 3 + out.size === "word" ? 2 : 1,
            position: instruction.position,
          },
          opSize: out.size,
          out: { type: "memory", mode: "direct", address: out.value },
          src: { type: "immediate", value: src.value },
        };
      } else {
        return {
          type: instruction.instruction,
          meta: {
            label: instruction.label,
            start: 0,
            length: 1 + out.size === "word" ? 2 : 1,
            position: instruction.position,
          },
          opSize: out.size,
          out: { type: "memory", mode: "indirect" },
          src: { type: "immediate", value: src.value },
        };
      }
    })
    .with([{ type: P.union("address", "label") }, { type: "address" }], () => {
      throw new CompilerError(
        "Can't access to a memory location twice in the same instruction.",
        ...instruction.position,
      );
    })
    .exhaustive();
}

function typeGuardRegister(reg: Extract<Operand, { type: "register" }>) {
  if (isMatching(byteRegisterPattern, reg.value)) {
    return { type: "register", size: "byte", value: reg.value, position: reg.position } as const;
  } else {
    return { type: "register", size: "word", value: reg.value, position: reg.position } as const;
  }
}

function getLabelType(operand: Extract<Operand, { type: "label" }>, labels: LabelTypes) {
  const labelType = labels.get(operand.label);
  if (!labelType) {
    throw new CompilerError(`Label ${operand.label} is not defined.`, ...operand.position);
  }
  return labelType;
}

function labelToMemoryDirect(
  label: Extract<Operand, { type: "label" }>,
): Extract<MemoryOperand, { mode: "direct" }> {
  return {
    type: "memory",
    mode: "direct",
    address: { type: "label", offset: true, value: label.label, position: label.position },
  };
}

function labelToImmediate(label: Extract<Operand, { type: "label" }>): ImmediateOperand {
  return {
    type: "immediate",
    value: { type: "label", offset: false, value: label.label, position: label.position },
  };
}
