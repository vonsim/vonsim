import type { Instruction as InstructionName } from "@vonsim/assembler";
import type { Byte, ByteSize } from "@vonsim/common/byte";
import type { Position } from "@vonsim/common/position";

import type { SimulatorError } from "../error";
import type { ByteRegister, WordRegister } from "./types";

export type InstructionMetadata = {
  name: InstructionName;
  position: Position;
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
  | { type: "cpu:cycle.interrupt" }
  | { type: "cpu:cycle.end" } // End of a cycle
  | {
      type: "cpu:alu.execute";
      operation: string;
      size: ByteSize;
      result: Byte<16>;
      flags: Byte<16>;
    }
  | { type: "cpu:decode" }
  | { type: "cpu:mar.set"; register: "IP" | "SP" | "ri" }
  | { type: "cpu:mbr.get"; register: ByteRegister }
  | { type: "cpu:mbr.set"; register: ByteRegister }
  | { type: "cpu:register.copy"; size: 8; src: ByteRegister; dest: ByteRegister }
  | { type: "cpu:register.copy"; size: 16; src: WordRegister; dest: WordRegister }
  | { type: "cpu:register.update"; size: 8; register: ByteRegister; value: Byte<8> }
  | { type: "cpu:register.update"; size: 16; register: WordRegister; value: Byte<16> }
  | { type: "cpu:inta.on" }
  | { type: "cpu:inta.off" }
  | { type: `cpu:int.${0 | 3 | 6 | 7}` }
  | { type: "cpu:error"; error: SimulatorError<any> }
  | { type: "cpu:halt" };
