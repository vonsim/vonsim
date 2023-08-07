import { atom } from "jotai";

import { store } from "@/lib/jotai";
import type { SimulatorEvent } from "@/simulator/helpers";
import { simulator, simulatorStateAtom } from "@/simulator/state";

export const consoleAtom = atom("");

export async function handleConsoleEvent(event: SimulatorEvent<"console:">): Promise<void> {
  switch (event.type) {
    case "console:read": {
      // Set state.waitingForInput = true
      store.set(simulatorStateAtom, prev => {
        if (prev.type !== "running" || prev.waitingForInput) return prev;
        return { ...prev, waitingForInput: true };
      });

      // Wait until state.waitingForInput = false
      await new Promise<void>(resolve => {
        const interval = setInterval(() => {
          const state = store.get(simulatorStateAtom);
          if (state.type !== "running" || !state.waitingForInput) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
      return;
    }

    case "console:write": {
      store.set(consoleAtom, simulator.getComputerState()!.io.console);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
