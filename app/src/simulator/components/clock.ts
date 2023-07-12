import type { SimulatorEvent } from "@/simulator/helpers";

export function handleClockEvent(event: SimulatorEvent<"clock:">): void {
  switch (event.type) {
    case "clock:tick":
      return;

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
