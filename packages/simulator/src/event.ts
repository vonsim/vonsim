import type { MemoryAddress } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";

export type PhysicalRegisters =
  | `${"A" | "B" | "C" | "D"}${"X" | "L" | "H"}` // General Purpose Registers
  | "SP" // (16 bits) Stack Pointer
  | "IP" // (16 bits) Instruction Pointer
  | "IR" // (8 bits) Instruction Register
  | "RI" // (8 bits) Register Index
  | "SI"; // (8 bits) Source Index

export type InstructionProgress =
  | { step: "discovery" }
  | { step: "fetch-operands"; name: string; operands: string[] }
  | { step: "execute"; name: string; operands: string[] }
  | { step: "write-operands"; name: string; operands: string[] }
  | { step: "interrupt"; name: string; operands: string[] };

export type CPUEvent =
  | { type: "alu.set"; left: Byte; right: Byte }
  | { type: "alu.execute"; operation: string; result: Byte }
  | { type: "alu.read"; result: Byte }
  | { type: "decode" }
  | { type: "mar.set"; register: "IP" | "SP" | "RI" }
  | { type: "mbr.get"; register: PhysicalRegisters }
  | { type: "mbr.set"; register: PhysicalRegisters }
  | { type: "register.copy"; input: PhysicalRegisters; output: PhysicalRegisters }
  | { type: "register.update"; register: PhysicalRegisters; value: Byte };

export type SimulatorCylce = { progress: InstructionProgress } & (
  | { type: "cpu"; events: CPUEvent[] }
  | { type: "memory.read"; address: MemoryAddress; value: Byte }
  | { type: "memory.write"; address: MemoryAddress; value: Byte }
);
