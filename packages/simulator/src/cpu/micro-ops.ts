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
  | { type: "cycle.start"; instruction: InstructionMetadata } // Start of a cycle
  | { type: "cycle.update"; phase: "decoded" } // Once there is enough information to know what an instruction will do (not the operands yet)
  | { type: "cycle.update"; phase: "execute" } // Once the operands are known
  | { type: "cycle.update"; phase: "writeback" } // Once the instruction has been executed and the result is ready to be written back
  | { type: "cycle.update"; phase: "interrupt" }
  | { type: "cycle.end" } // End of a cycle
  | { type: "alu.execute"; operation: string; size: 8; result: Byte<8>; flags: Byte<16> }
  | { type: "alu.execute"; operation: string; size: 16; result: Byte<16>; flags: Byte<16> }
  | { type: "decode" }
  | { type: "mar.set"; register: "IP" | "SP" | "ri" }
  | { type: "mbr.get"; register: Physical8bitsRegisters }
  | { type: "mbr.set"; register: Physical8bitsRegisters }
  | { type: "register.copy"; input: Physical8bitsRegisters; output: Physical8bitsRegisters }
  | { type: "register.copy"; input: Physical16bitsRegisters; output: Physical16bitsRegisters }
  | { type: "register.update"; register: Physical8bitsRegisters; value: Byte<8> }
  | { type: "register.update"; register: Physical16bitsRegisters; value: Byte<16> }
  | { type: "inta.on" | "inta.off" }
  | { type: "int.0" | "int.3" | "int.6" | "int.7" }
  | { type: "console.read" } // This event must be followed by a generator.next(Byte<8>)
  | { type: "console.write"; char: Byte<8> }
  | { type: "error"; error: SimulatorError<any> }
  | { type: "halt" };
