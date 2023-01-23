import { Err, Ok } from "rust-optionals";

import type { SimulatorSlice } from "@/simulator";
import { SimulatorResult } from "@/simulator/error";

export type InterruptsSlice = {
  interruptsEnabled: boolean;
  enableInterrupts: () => void;
  disableInterrupts: () => void;
  handleInt6: (char: string) => SimulatorResult<void>;
};

export const createInterruptsSlice: SimulatorSlice<InterruptsSlice> = (set, get) => ({
  interruptsEnabled: true,
  enableInterrupts: () => set({ interruptsEnabled: true }),
  disableInterrupts: () => set({ interruptsEnabled: false }),

  /**
   * Handles the char received after an INT 6 instruction.
   */
  handleInt6: char => {
    const address = get().getRegister("BX");

    const saved = get().setMemory(address, "byte", char.charCodeAt(0));
    if (saved.isErr()) return Err(saved.unwrapErr());

    get().devices.console.write(char);
    return Ok();
  },
});
