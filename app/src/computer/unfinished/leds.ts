import { Byte } from "@vonsim/common/byte";
import { atom } from "jotai";

import type { SimulatorEvent } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

export const ledsAtom = atom(Byte.zero(8));

export function handleLedsEvent(event: SimulatorEvent<"leds:">): void {
  switch (event.type) {
    case "leds:update": {
      store.set(ledsAtom, event.state);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
