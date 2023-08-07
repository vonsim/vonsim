import { store } from "@/lib/jotai";
import {
  activateRegister,
  deactivateRegister,
  populateDataBus,
  turnLineOff,
  turnLineOn,
} from "@/simulator/computer/shared/animate";
import type { SimulatorEvent } from "@/simulator/helpers";

import { COMPAtom, CONTAtom } from "./state";

export async function handleTimerEvent(event: SimulatorEvent<"timer:">): Promise<void> {
  switch (event.type) {
    case "timer:read":
      return;

    case "timer:read.ok": {
      await populateDataBus(event.value);
      return;
    }

    case "timer:write":
      return;

    case "timer:register.update": {
      await activateRegister(`timer.${event.register}`);
      switch (event.register) {
        case "CONT": {
          store.set(CONTAtom, event.value);
          break;
        }

        case "COMP": {
          store.set(COMPAtom, event.value);
          break;
        }

        default: {
          const _exhaustiveCheck: never = event.register;
          return _exhaustiveCheck;
        }
      }
      await deactivateRegister(`timer.${event.register}`);
      return;
    }

    case "timer:write.ok":
      return;

    case "timer:int.off": {
      await turnLineOff("int1");
      return;
    }

    case "timer:int.on": {
      await turnLineOn("int1", 10);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
