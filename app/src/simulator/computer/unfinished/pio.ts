import { Byte } from "@vonsim/common/byte";
import { atom } from "jotai";

import { store } from "@/lib/jotai";
import { MBRAtom } from "@/simulator/computer/cpu/state";
import type { SimulatorEvent } from "@/simulator/helpers";

export const PAAtom = atom(Byte.zero(8));
export const PBAtom = atom(Byte.zero(8));
export const CAAtom = atom(Byte.zero(8));
export const CBAtom = atom(Byte.zero(8));

export function handlePIOEvent(event: SimulatorEvent<"pio:">): void {
  switch (event.type) {
    case "pio:read":
      return;

    case "pio:read.ok": {
      store.set(MBRAtom, event.value);
      return;
    }

    case "pio:write":
    case "pio:register.update": {
      switch (event.register) {
        case "PA": {
          store.set(PAAtom, event.value);
          return;
        }

        case "PB": {
          store.set(PBAtom, event.value);
          return;
        }

        case "CA": {
          store.set(CAAtom, event.value);
          return;
        }

        case "CB": {
          store.set(CBAtom, event.value);
          return;
        }

        default: {
          const _exhaustiveCheck: never = event.register;
          return _exhaustiveCheck;
        }
      }
    }

    case "pio:write.ok":
      return;

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
