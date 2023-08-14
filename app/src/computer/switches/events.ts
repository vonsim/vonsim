import type { SimulatorEvent } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

import { switchesAtom } from "./state";

export async function handleSwitchesEvent(event: SimulatorEvent<"switches:">): Promise<void> {
  switch (event.type) {
    case "switches:toggle": {
      store.set(switchesAtom, switches =>
        switches.withBit(event.index, !switches.bit(event.index)),
      );
      return;
    }

    default: {
      const _exhaustiveCheck: never = event.type;
      return _exhaustiveCheck;
    }
  }
}
