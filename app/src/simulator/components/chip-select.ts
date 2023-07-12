import type { SimulatorEvent } from "@/simulator/helpers";
import { finish } from "@/simulator/state";

export function handleChipSelectEvent(event: SimulatorEvent<"cs:">): void {
  switch (event.type) {
    case "cs:selected":
      return;

    case "cs:error": {
      finish(event.error);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
