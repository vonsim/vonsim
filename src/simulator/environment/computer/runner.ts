import { toast } from "react-hot-toast";
import { isMatching, match, P } from "ts-pattern";
import type { ProgramInstruction } from "~/compiler";
import type { BinaryInstructionType } from "~/compiler/common";
import { jumpInstructionPattern } from "~/compiler/common/patterns";
import { useComputer } from ".";
import { highlightLine } from "../../editor/line-highlight";
import { renderAddress } from "../helpers";

const computer = () => useComputer.getState();

/**
 * Executes a single instruction.
 * Returns true if the execution should continue, false otherwise.
 */
export function runInstruction(): boolean {
  const program = computer().program;
  if (!program) {
    toast.error("No hay ningún programa cargado. Compilá antes de ejecutar.");
    return false;
  }

  const IP = computer().registers.IP;

  const instruction = program.instructions.find(instruction => instruction.meta.start === IP);
  if (!instruction) {
    toast.error(
      `Se esperaba una instrucción en la dirección de memoria ${renderAddress(
        IP,
      )} pero no se encontró ninguna.`,
    );
    return false;
  }

  highlightLine(instruction.meta.position[0]);

  const IR = computer().getMemory(IP, "byte");
  computer().setRegister("IR", IR);

  if (instruction.type === "HLT") {
    return false;
  }

  if (isMatching({ type: jumpInstructionPattern }, instruction)) {
    if (instruction.type === "CALL") {
      // TODO: Implementar CALL
      return true;
    }

    const jump = match(instruction.type)
      .with("JMP", () => true)
      .with("JZ", () => computer().alu.flags.zero)
      .with("JNZ", () => !computer().alu.flags.zero)
      .with("JS", () => computer().alu.flags.sign)
      .with("JNS", () => !computer().alu.flags.sign)
      .with("JC", () => computer().alu.flags.carry)
      .with("JNC", () => !computer().alu.flags.carry)
      .with("JO", () => computer().alu.flags.overflow)
      .with("JNO", () => !computer().alu.flags.overflow)
      .exhaustive();

    if (jump) {
      computer().setRegister("IP", instruction.jumpTo);
      return true;
    }
  }

  match(instruction)
    .with({ type: "MOV" }, ({ opSize, out, src }) => {
      const value = getOperandValue(src, opSize);
      saveInOperand(out, opSize, value);
    })
    .with({ type: P.union("ADD", "ADC", "SUB", "SBB") }, ({ type, opSize, out, src }) => {
      const left = getOperandValue(out, opSize);
      const right = getOperandValue(src, opSize);
      const result = computer().executeArithmetic(type, left, right, opSize);
      saveInOperand(out, opSize, result);
    })
    .with({ type: P.union("AND", "OR", "XOR") }, ({ type, opSize, out, src }) => {
      const left = getOperandValue(out, opSize);
      const right = getOperandValue(src, opSize);
      const result = computer().executeLogical(type, left, right, opSize);
      saveInOperand(out, opSize, result);
    })
    .with({ type: "NOT" }, ({ type, opSize, out }) => {
      const right = getOperandValue(out, opSize);
      const result = computer().executeLogical(type, 0, right, opSize);
      saveInOperand(out, opSize, result);
    })
    .with({ type: "CMP" }, ({ opSize, out, src }) => {
      const left = getOperandValue(out, opSize);
      const right = getOperandValue(src, opSize);
      computer().executeArithmetic("SUB", left, right, opSize);
    })
    .with({ type: "INC" }, ({ opSize, out }) => {
      const left = getOperandValue(out, opSize);
      const result = computer().executeArithmetic("ADD", left, 1, opSize);
      saveInOperand(out, opSize, result);
    })
    .with({ type: "DEC" }, ({ opSize, out }) => {
      const left = getOperandValue(out, opSize);
      const result = computer().executeArithmetic("SUB", left, 1, opSize);
      saveInOperand(out, opSize, result);
    })
    .with({ type: "NEG" }, ({ opSize, out }) => {
      const right = getOperandValue(out, opSize);
      const result = computer().executeArithmetic("SUB", 0, right, opSize);
      saveInOperand(out, opSize, result);
    })
    .otherwise(console.log);
  // .exhaustive();

  computer().setRegister("IP", IP + instruction.meta.length);

  return true;
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
