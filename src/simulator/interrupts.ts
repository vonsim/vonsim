import type { ComputerSlice } from "~/simulator";

export type InterruptsSlice = {
  interruptsEnabled: boolean;
  enableInterrupts: () => void;
  disableInterrupts: () => void;
};

export const createInterruptsSlice: ComputerSlice<InterruptsSlice> = set => ({
  interruptsEnabled: true,
  enableInterrupts: () => set({ interruptsEnabled: true }),
  disableInterrupts: () => set({ interruptsEnabled: false }),
});
