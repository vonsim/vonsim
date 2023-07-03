import type { Instruction as InstructionName } from "@vonsim/assembler";
import type { Byte } from "@vonsim/common/byte";

import type { SimulatorError } from "../error";

export type Physical8bitsRegisters =
  | `${"A" | "B" | "C" | "D"}${"L" | "H"}` // General Purpose Registers
  | "IR" // Instruction Register
  | `SP.${"l" | "h"}` // Stack Pointer
  | `ri.${"l" | "h"}` // Register Index
  | `id.${"l" | "h"}` // Immediate Register
  | `left.${"l" | "h"}` // Left operand for ALU
  | `right.${"l" | "h"}` // Right operand for ALU
  | `result.${"l" | "h"}`; // Result of ALU

export type Physical16bitsRegisters =
  | `${"A" | "B" | "C" | "D"}X` // General Purpose Registers
  | "SP" // Stack Pointer
  | "IP" //  Instruction Pointer
  | "ri" // Register Index
  | "id" // Immediate Register
  | "left" // Left operand for ALU
  | "right" // Right operand for ALU
  | "result" // Result of ALU
  | "FLAGS"; // Flags

export type InstructionMetadata = {
  name: InstructionName;
  operands: string[];
  willUse: Partial<{
    ri: boolean;
    id: boolean;
    execute: boolean;
    writeback: boolean;
  }>;
};

export type CPUMicroOperation =
  | { type: "cpu:cycle.start"; instruction: InstructionMetadata } // Start of a cycle
  | { type: "cpu:cycle.update"; phase: "decoded" } // Once there is enough information to know what an instruction will do (not the operands yet)
  | { type: "cpu:cycle.update"; phase: "execute" } // Once the operands are known
  | { type: "cpu:cycle.update"; phase: "writeback" } // Once the instruction has been executed and the result is ready to be written back
  | { type: "cpu:cycle.update"; phase: "interrupt" }
  | { type: "cpu:cycle.end" } // End of a cycle
  | { type: "cpu:alu.execute"; operation: string; size: 8; result: Byte<8>; flags: Byte<16> }
  | { type: "cpu:alu.execute"; operation: string; size: 16; result: Byte<16>; flags: Byte<16> }
  | { type: "cpu:decode" }
  | { type: "cpu:mar.set"; register: "IP" | "SP" | "ri" }
  | { type: "cpu:mbr.get"; register: Physical8bitsRegisters }
  | { type: "cpu:mbr.set"; register: Physical8bitsRegisters }
  | { type: "cpu:register.copy"; input: Physical8bitsRegisters; output: Physical8bitsRegisters }
  | { type: "cpu:register.copy"; input: Physical16bitsRegisters; output: Physical16bitsRegisters }
  | { type: "cpu:register.update"; register: Physical8bitsRegisters; value: Byte<8> }
  | { type: "cpu:register.update"; register: Physical16bitsRegisters; value: Byte<16> }
  | { type: "cpu:inta.on" }
  | { type: "cpu:inta.off" }
  | { type: `cpu:int.${0 | 3 | 6 | 7}` }
  | { type: "cpu:error"; error: SimulatorError<any> }
  | { type: "cpu:halt" };
