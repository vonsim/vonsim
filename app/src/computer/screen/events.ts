import type { SimulatorEvent } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

import { screenAtom } from "./state";

export async function handleScreenEvent(event: SimulatorEvent<"screen:">): Promise<void> {
  switch (event.type) {
    case "screen:send-char": {
      store.set(screenAtom, event.output);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event.type;
      return _exhaustiveCheck;
    }
  }
}
