import { turnLineOff, turnLineOn } from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";

export async function handleF10Event(event: SimulatorEvent<"f10:">): Promise<void> {
  switch (event.type) {
    case "f10:press":
      await turnLineOn("bus.int0", 2);
      await turnLineOff("bus.int0");
      return;

    default: {
      const _exhaustiveCheck: never = event.type;
      return _exhaustiveCheck;
    }
  }
}
