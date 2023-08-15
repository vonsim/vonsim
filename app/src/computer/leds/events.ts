import { turnLineOff, turnLineOn } from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

import { ledsAtom } from "./state";

export async function handleLedsEvent(event: SimulatorEvent<"leds:">): Promise<void> {
  switch (event.type) {
    case "leds:update": {
      await turnLineOn("bus.pio->leds", 10);
      store.set(ledsAtom, event.state);
      await turnLineOff("bus.pio->leds");
      return;
    }

    default: {
      const _exhaustiveCheck: never = event.type;
      return _exhaustiveCheck;
    }
  }
}
