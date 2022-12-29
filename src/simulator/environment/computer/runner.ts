import { toast } from "react-hot-toast";
import { match, P } from "ts-pattern";
import type { ProgramInstruction } from "~/compiler";
import type { BinaryInstructionType } from "~/compiler/common";
import { MAX_MEMORY_ADDRESS, MIN_MEMORY_ADDRESS } from "~/config";
import { useComputer } from ".";
import { highlightLine } from "../../editor/methods";
import { renderAddress } from "../helpers";

const computer = () => useComputer.getState();

/**
 * Executes a single instruction.
 * Returns true if the execution should continue, false otherwise.
 */
export function runInstruction(): boolean {
  try {
    const program = computer().program;
    if (!program) throw new Error("No hay ningún programa cargado. Compilá antes de ejecutar.");

    const IP = computer().registers.IP;

    const instruction = program.instructions.find(instruction => instruction.meta.start === IP);
    if (!instruction) {
      throw new Error(
        `Se esperaba una instrucción en la dirección de memoria ${renderAddress(
          IP,
        )} pero no se encontró ninguna.`,
      );
    }

    highlightLine(instruction.meta.position[0]);

    // Update the instruction register
    const IR = computer().getMemory(IP, "byte");
    computer().setRegister("IR", IR);

    // Most instructions ends in a IP bump with a `return true`.
    // It also allows passing a custom IP (for example, for jumps)
    const bumpIP = (overwrite?: number) => {
      computer().setRegister(
        "IP",
        typeof overwrite === "number" ? overwrite : IP + instruction.meta.length,
      );
      return true;
    };

    return match(instruction)
      .with({ type: "MOV" }, ({ opSize, out, src }) => {
        const value = getOperandValue(src, opSize);
        saveInOperand(out, opSize, value);

        return bumpIP();
      })
      .with({ type: P.union("ADD", "ADC", "SUB", "SBB") }, ({ type, opSize, out, src }) => {
        const left = getOperandValue(out, opSize);
        const right = getOperandValue(src, opSize);
        const result = computer().executeArithmetic(type, left, right, opSize);
        saveInOperand(out, opSize, result);

        return bumpIP();
      })
      .with({ type: P.union("AND", "OR", "XOR") }, ({ type, opSize, out, src }) => {
        const left = getOperandValue(out, opSize);
        const right = getOperandValue(src, opSize);
        const result = computer().executeLogical(type, left, right, opSize);
        saveInOperand(out, opSize, result);

        return bumpIP();
      })
      .with({ type: "NOT" }, ({ type, opSize, out }) => {
        const right = getOperandValue(out, opSize);
        const result = computer().executeLogical(type, 0, right, opSize);
        saveInOperand(out, opSize, result);

        return bumpIP();
      })
      .with({ type: "CMP" }, ({ opSize, out, src }) => {
        const left = getOperandValue(out, opSize);
        const right = getOperandValue(src, opSize);
        computer().executeArithmetic("SUB", left, right, opSize);

        return bumpIP();
      })
      .with({ type: "INC" }, ({ opSize, out }) => {
        const left = getOperandValue(out, opSize);
        const result = computer().executeArithmetic("ADD", left, 1, opSize);
        saveInOperand(out, opSize, result);

        return bumpIP();
      })
      .with({ type: "DEC" }, ({ opSize, out }) => {
        const left = getOperandValue(out, opSize);
        const result = computer().executeArithmetic("SUB", left, 1, opSize);
        saveInOperand(out, opSize, result);

        return bumpIP();
      })
      .with({ type: "NEG" }, ({ opSize, out }) => {
        const right = getOperandValue(out, opSize);
        const result = computer().executeArithmetic("SUB", 0, right, opSize);
        saveInOperand(out, opSize, result);

        return bumpIP();
      })
      .with({ type: "PUSH" }, ({ register }) => {
        let SP = computer().getRegister("SP");
        SP -= 2;
        if (SP < MIN_MEMORY_ADDRESS) throw new Error("Stack overflow");
        computer().setRegister("SP", SP);
        const value = computer().getRegister(register);
        computer().setMemory(SP, "word", value);

        return bumpIP();
      })
      .with({ type: "POP" }, ({ register }) => {
        let SP = computer().getRegister("SP");
        if (SP + 1 > MAX_MEMORY_ADDRESS) throw new Error("Stack underflow");
        const value = computer().getMemory(SP, "word");
        computer().setRegister(register, value);
        SP += 2;
        computer().setRegister("SP", SP);

        return bumpIP();
      })
      .with({ type: "PUSHF" }, () => {
        let SP = computer().getRegister("SP");
        SP -= 2;
        if (SP < MIN_MEMORY_ADDRESS) throw new Error("Stack overflow");
        computer().setRegister("SP", SP);
        const flags = computer().encodeFlags();
        computer().setMemory(SP, "word", flags);

        return bumpIP();
      })
      .with({ type: "POPF" }, ({}) => {
        let SP = computer().getRegister("SP");
        if (SP + 1 > MAX_MEMORY_ADDRESS) throw new Error("Stack underflow");
        const flags = computer().getMemory(SP, "word");
        computer().decodeFlags(flags);
        SP += 2;
        computer().setRegister("SP", SP);

        return bumpIP();
      })
      .with({ type: "CALL" }, ({ jumpTo, meta }) => {
        let SP = computer().getRegister("SP");
        SP -= 2;
        if (SP < MIN_MEMORY_ADDRESS) throw new Error("Stack overflow");
        computer().setRegister("SP", SP);

        const returnAddress = IP + meta.length;
        computer().setMemory(SP, "word", returnAddress);

        return bumpIP(jumpTo);
      })
      .with({ type: "RET" }, () => {
        let SP = computer().getRegister("SP");
        if (SP + 1 > MAX_MEMORY_ADDRESS) throw new Error("Stack underflow");
        const returnAddress = computer().getMemory(SP, "word");
        SP += 2;
        computer().setRegister("SP", SP);

        return bumpIP(returnAddress);
      })
      .with({ type: "JMP" }, ({ jumpTo }) => bumpIP(jumpTo))
      .with({ type: "JZ" }, ({ jumpTo }) => bumpIP(computer().alu.flags.zero ? jumpTo : undefined))
      .with({ type: "JNZ" }, ({ jumpTo }) =>
        bumpIP(!computer().alu.flags.zero ? jumpTo : undefined),
      )
      .with({ type: "JS" }, ({ jumpTo }) => bumpIP(computer().alu.flags.sign ? jumpTo : undefined))
      .with({ type: "JNS" }, ({ jumpTo }) =>
        bumpIP(!computer().alu.flags.sign ? jumpTo : undefined),
      )
      .with({ type: "JC" }, ({ jumpTo }) => bumpIP(computer().alu.flags.carry ? jumpTo : undefined))
      .with({ type: "JNC" }, ({ jumpTo }) =>
        bumpIP(!computer().alu.flags.carry ? jumpTo : undefined),
      )
      .with({ type: "JO" }, ({ jumpTo }) =>
        bumpIP(computer().alu.flags.overflow ? jumpTo : undefined),
      )
      .with({ type: "JNO" }, ({ jumpTo }) =>
        bumpIP(!computer().alu.flags.overflow ? jumpTo : undefined),
      )
      .with({ type: "IN" }, () => {
        throw new Error("Sin implementación");
      })
      .with({ type: "OUT" }, () => {
        throw new Error("Sin implementación");
      })
      .with({ type: "INT" }, () => {
        throw new Error("Sin implementación");
      })
      .with({ type: "IRET" }, () => {
        throw new Error("Sin implementación");
      })
      .with({ type: "CLI" }, () => {
        throw new Error("Sin implementación");
      })
      .with({ type: "STI" }, () => {
        throw new Error("Sin implementación");
      })
      .with({ type: "NOP" }, () => bumpIP())
      .with({ type: "HLT" }, () => false)
      .exhaustive();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      console.error(error);
      toast.error(String(error));
    }
    return false;
  }
}

function getOperandValue(
  operand: Extract<ProgramInstruction, { type: BinaryInstructionType }>["src"],
  opSize: "byte" | "word",
): number {
  return match(operand)
    .with({ type: "register" }, ({ register }) => computer().getRegister(register))
    .with({ type: "memory", mode: "direct" }, ({ address }) =>
      computer().getMemory(address, opSize),
    )
    .with({ type: "memory", mode: "indirect" }, () => {
      const address = computer().getRegister("BX");
      return computer().getMemory(address, opSize);
    })
    .with({ type: "immediate" }, ({ value }) => value)
    .exhaustive();
}

function saveInOperand(
  operand: Extract<ProgramInstruction, { type: BinaryInstructionType }>["out"],
  opSize: "byte" | "word",
  value: number,
) {
  match(operand)
    .with({ type: "register" }, ({ register }) => {
      computer().setRegister(register, value);
    })
    .with({ type: "memory", mode: "direct" }, ({ address }) => {
      computer().setMemory(address, opSize, value);
    })
    .with({ type: "memory", mode: "indirect" }, () => {
      const address = computer().getRegister("BX");
      computer().setMemory(address, opSize, value);
    })
    .exhaustive();
}
