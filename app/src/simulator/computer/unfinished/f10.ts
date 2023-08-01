import type { SimulatorEvent } from "@/simulator/helpers";

export function handleF10Event(event: SimulatorEvent<"f10:">): void {
  switch (event.type) {
    case "f10:press":
      return;

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
