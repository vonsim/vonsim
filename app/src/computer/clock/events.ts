import type { SimulatorEvent } from "@/computer/shared/types";

export async function handleClockEvent(event: SimulatorEvent<"clock:">): Promise<void> {
  switch (event.type) {
    case "clock:tick":
      return;

    default: {
      const _exhaustiveCheck: never = event.type;
      return _exhaustiveCheck;
    }
  }
}
