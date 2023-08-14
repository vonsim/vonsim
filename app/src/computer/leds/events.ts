import type { SimulatorEvent } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

import { ledsAtom } from "./state";

export async function handleLedsEvent(event: SimulatorEvent<"leds:">): Promise<void> {
  switch (event.type) {
    case "leds:update": {
      store.set(ledsAtom, event.state);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event.type;
      return _exhaustiveCheck;
    }
  }
}
