import { atom } from "jotai";

import { store } from "@/lib/jotai";
import type { SimulatorEvent } from "@/simulator/helpers";
import { simulator, simulatorStateAtom } from "@/simulator/state";

export const consoleAtom = atom("");

export function handleConsoleEvent(event: SimulatorEvent<"console:">): void {
  switch (event.type) {
    case "console:read": {
      store.set(simulatorStateAtom, prev => {
        if (prev.type === "running" || prev.type === "paused") {
          return { type: "waiting-for-input", previousState: prev.type };
        } else {
          return prev;
        }
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
