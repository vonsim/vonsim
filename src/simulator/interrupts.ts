import type { SimulatorSlice } from "~/simulator";

export type InterruptsSlice = {
  interruptsEnabled: boolean;
  enableInterrupts: () => void;
  disableInterrupts: () => void;
};

export const createInterruptsSlice: SimulatorSlice<InterruptsSlice> = set => ({
  interruptsEnabled: true,
  enableInterrupts: () => set({ interruptsEnabled: true }),
  disableInterrupts: () => set({ interruptsEnabled: false }),
});
