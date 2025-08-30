import type { Instruction as InstructionName } from "@vonsim/assembler";
import type { Byte } from "@vonsim/common/byte";
import type { Position } from "@vonsim/common/position";
import type { ConditionalKeys } from "type-fest";

export type Flag =
  | "CF" // Carry Flag
  | "ZF" // Zero Flag
  | "SF" // Sign Flag
  | "IF" // Interrupt Flag
  | "OF"; // Overflow Flag

export type PartialFlags = Partial<Record<Flag, boolean>>;

/**
 * All the physical registers of the CPU.
 */
export type RegistersMap = {
  AX: Byte<16>; // Accumulator
  BX: Byte<16>; // Base
  CX: Byte<16>; // Counter
  DX: Byte<16>; // Data
  SP: Byte<16>; // Stack Pointer
  BP: Byte<16>; // Base Pointer
  IP: Byte<16>; // Instruction Pointer
  IR: Byte<8>; // Instruction Register
  ri: Byte<16>; // Register Index
  id: Byte<16>; // Immediate Data
  left: Byte<16>; // Left operand for ALU
  right: Byte<16>; // Right operand for ALU
  result: Byte<16>; // Result of ALU
  FLAGS: Byte<16>; // Flags register
};
export type PhysicalRegister = keyof RegistersMap;

/**
 * Partial registers, like AL, AH, BL, BH, etc,
 * which are part of a full register (AX, BX, etc).
 * These are all of 8 bits.
 */
export type PartialRegisters =
  | `${"A" | "B" | "C" | "D"}${"L" | "H"}`
  | `${"SP" | "BP" | "IP" | "ri" | "id" | "left" | "right" | "result" | "FLAGS"}.${"l" | "h"}`;

export type ByteRegister = ConditionalKeys<RegistersMap, Byte<8>> | PartialRegisters;
export type WordRegister = ConditionalKeys<RegistersMap, Byte<16>>;
export type Register = ByteRegister | WordRegister;

/**
 * The registers that has a connection to the Memory Address Register (MAR).
 */
export type MARRegister = "IP" | "SP" | "ri";

/**
 * Metadata about an instruction emitted along with the `cpu:cycle.start` event.
 */
export type InstructionMetadata = {
  name: InstructionName;
  position: Position;
  operands: string[];
  willUse: Partial<{ ri: boolean; id: boolean }>;
};
