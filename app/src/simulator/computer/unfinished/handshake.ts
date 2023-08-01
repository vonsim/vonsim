import { Byte } from "@vonsim/common/byte";
import { atom } from "jotai";

import { store } from "@/lib/jotai";
import { MBRAtom } from "@/simulator/computer/cpu/state";
import type { SimulatorEvent } from "@/simulator/helpers";

export const DATAAtom = atom(Byte.fromUnsigned(0x00, 8));
export const STATEAtom = atom(Byte.fromUnsigned(0x01, 8));

export function handleHandshakeEvent(event: SimulatorEvent<"handshake:">): void {
  switch (event.type) {
    case "handshake:read":
      return;

    case "handshake:read.ok": {
      store.set(MBRAtom, event.value);
      return;
    }

    case "handshake:write":
    case "handshake:register.update": {
      switch (event.register) {
        case "DATA": {
          store.set(DATAAtom, event.value);
          return;
        }

        case "STATE": {
          store.set(STATEAtom, event.value);
          return;
        }

        default: {
          const _exhaustiveCheck: never = event.register;
          return _exhaustiveCheck;
        }
      }
    }

    case "handshake:write.ok":
      return;

    case "handshake:interrupt":
      return;

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
