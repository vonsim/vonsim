import { turnLineOff, turnLineOn } from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";

export async function handleF10Event(event: SimulatorEvent<"f10:">): Promise<void> {
  switch (event.type) {
    case "f10:press":
      return;

    case "f10:int.off": {
      await turnLineOff("bus.int0");
      return;
    }

    case "f10:int.on": {
      await turnLineOn("bus.int0", 10);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
