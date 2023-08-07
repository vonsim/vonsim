import { turnLineOff, turnLineOn } from "@/simulator/computer/shared/animate";
import type { SimulatorEvent } from "@/simulator/helpers";

export async function handleF10Event(event: SimulatorEvent<"f10:">): Promise<void> {
  switch (event.type) {
    case "f10:press":
      return;

    case "f10:int.off": {
      await turnLineOff("int0");
      return;
    }

    case "f10:int.on": {
      await turnLineOn("int0", 10);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
