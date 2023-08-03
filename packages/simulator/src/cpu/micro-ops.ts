import type { Byte, ByteSize } from "@vonsim/common/byte";

import type { SimulatorError } from "../error";
import type { ByteRegister, InstructionMetadata, WordRegister } from "./types";

/**
 * All events that can be emitted by the CPU.
 */
export type CPUMicroOperation =
  | { type: "cpu:cycle.start"; instruction: InstructionMetadata } // Start of a cycle, implicit phase "fetch and decode"
  // Once there is enough information to know what an instruction will do.
  | { type: "cpu:cycle.update"; phase: "decoded"; next: "fetch-operands" | "execute" | "writeback" }
  | { type: "cpu:cycle.update"; phase: "execute" } // Start "execute" phase. Not necesary when "next" is "execute"
  | { type: "cpu:cycle.update"; phase: "writeback" } // Start "writeback" phase. Not necesary when "next" is "writeback"
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
  | { type: "cpu:rd.on" }
  | { type: "cpu:wr.on" }
  | { type: "cpu:iom.on" }
  | { type: "cpu:inta.on" }
  | { type: "cpu:inta.off" }
  | { type: `cpu:int.${0 | 3 | 6 | 7}` }
  | { type: "cpu:error"; error: SimulatorError<any> }
  | { type: "cpu:halt" };
