import { atom } from "jotai";

import type { SimulatorEvent } from "@/computer/shared/types";
import { simulationAtom, simulator } from "@/computer/state";
import { store } from "@/lib/jotai";

export const consoleAtom = atom("");

export async function handleConsoleEvent(event: SimulatorEvent<"console:">): Promise<void> {
  switch (event.type) {
    case "console:read": {
      // Set state.waitingForInput = true
      store.set(simulationAtom, prev => {
        if (prev.type !== "running" || prev.waitingForInput) return prev;
        return { ...prev, waitingForInput: true };
      });

      // Wait until state.waitingForInput = false
      await new Promise<void>(resolve => {
        store.sub(simulationAtom, () => {
          const status = store.get(simulationAtom);
          if (status.type !== "running" || !status.waitingForInput) {
            resolve();
          }
        });
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
