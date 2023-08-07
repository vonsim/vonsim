import { store } from "@/lib/jotai";
import {
  activateRegister,
  deactivateRegister,
  populateDataBus,
  turnLineOff,
  turnLineOn,
} from "@/simulator/computer/shared/animate";
import type { SimulatorEvent } from "@/simulator/helpers";

import { IMRAtom, IRRAtom, ISRAtom, linesAtoms } from "./state";

export async function handlePICEvent(event: SimulatorEvent<"pic:">): Promise<void> {
  switch (event.type) {
    case "pic:read":
      return;

    case "pic:read.ok": {
      await populateDataBus(event.value);
      return;
    }

    case "pic:write":
      return;

    case "pic:register.update": {
      await activateRegister(`pic.${event.register}`);
      switch (event.register) {
        case "IMR": {
          store.set(IMRAtom, event.value);
          break;
        }

        case "IRR": {
          store.set(IRRAtom, event.value);
          break;
        }

        case "ISR": {
          store.set(ISRAtom, event.value);
          break;
        }

        case "INT0":
        case "INT1":
        case "INT2":
        case "INT3":
        case "INT4":
        case "INT5":
        case "INT6":
        case "INT7": {
          const n = Number(event.register.slice(3));
          store.set(linesAtoms[n], event.value);
          break;
        }

        default: {
          const _exhaustiveCheck: never = event;
          return _exhaustiveCheck;
        }
      }
      await deactivateRegister(`pic.${event.register}`);
      return;
    }

    case "pic:write.ok":
      return;

    case "pic:intr.off": {
      await turnLineOff("intr");
      return;
    }

    case "pic:intr.on": {
      await turnLineOn("intr", 10);
      return;
    }

    case "pic:int.send": {
      await populateDataBus(event.number);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
