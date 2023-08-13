import { activateRegister, deactivateRegister, populateDataBus } from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

import { CAAtom, CBAtom, PAAtom, PBAtom } from "./state";

export async function handlePIOEvent(event: SimulatorEvent<"pio:">): Promise<void> {
  switch (event.type) {
    case "pio:read":
      return;

    case "pio:read.ok": {
      await populateDataBus(event.value);
      return;
    }

    case "pio:write":
      return;

    case "pio:register.update": {
      await activateRegister(`pio.${event.register}`);
      switch (event.register) {
        case "PA": {
          store.set(PAAtom, event.value);
          break;
        }

        case "PB": {
          store.set(PBAtom, event.value);
          break;
        }

        case "CA": {
          store.set(CAAtom, event.value);
          break;
        }

        case "CB": {
          store.set(CBAtom, event.value);
          break;
        }

        default: {
          const _exhaustiveCheck: never = event.register;
          return _exhaustiveCheck;
        }
      }
      await deactivateRegister(`pio.${event.register}`);
      return;
    }

    case "pio:write.ok":
      return;

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
