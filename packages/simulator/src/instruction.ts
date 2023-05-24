import type { MemoryAddress } from "@vonsim/common/address";

import type { Computer } from "./computer";
import type { SimulatorCylce } from "./event";

export type InstructionSteps = Generator<SimulatorCylce, void>;

export abstract class Instruction {
  constructor(readonly start: MemoryAddress) {}

  abstract next(computer: Computer): InstructionSteps;
  abstract toBytes(): Uint8Array;
}
