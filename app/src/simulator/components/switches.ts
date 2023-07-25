import { Byte } from "@vonsim/common/byte";

import { atom, store } from "@/lib/jotai";
import type { SimulatorEvent } from "@/simulator/helpers";

export const switchesAtom = atom(Byte.zero(8));

export function handleSwitchesEvent(event: SimulatorEvent<"switches:">): void {
  switch (event.type) {
    case "switches:toggle": {
      store.set(switchesAtom, switches =>
        switches.withBit(event.index, !switches.bit(event.index)),
      );
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
