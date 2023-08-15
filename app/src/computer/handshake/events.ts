import {
  activateRegister,
  deactivateRegister,
  populateDataBus,
  turnLineOff,
  turnLineOn,
} from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

import { DATAAtom, STATEAtom } from "./state";

export async function handleHandshakeEvent(event: SimulatorEvent<"handshake:">): Promise<void> {
  switch (event.type) {
    case "handshake:read":
      return;

    case "handshake:read.ok": {
      await populateDataBus(event.value);
      return;
    }

    case "handshake:write":
    case "handshake:register.update": {
      await activateRegister(`handshake.${event.register}`);
      switch (event.register) {
        case "DATA": {
          store.set(DATAAtom, event.value);
          break;
        }

        case "STATE": {
          store.set(STATEAtom, event.value);
          break;
        }

        default: {
          const _exhaustiveCheck: never = event.register;
          return _exhaustiveCheck;
        }
      }
      await deactivateRegister(`handshake.${event.register}`);
      return;
    }

    case "handshake:write.ok":
      return;

    case "handshake:int.off": {
      await turnLineOff("bus.int2");
      return;
    }

    case "handshake:int.on": {
      await turnLineOn("bus.int2", 10);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
