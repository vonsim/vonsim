import { Byte } from "@vonsim/common/byte";

import { atom, store } from "@/lib/jotai";
import { MBRAtom } from "@/simulator/components/bus";
import type { SimulatorEvent } from "@/simulator/helpers";

export const CONTAtom = atom(Byte.zero(8));
export const COMPAtom = atom(Byte.zero(8));

export function handleTimerEvent(event: SimulatorEvent<"timer:">): void {
  switch (event.type) {
    case "timer:read":
      return;

    case "timer:read.ok": {
      store.set(MBRAtom, event.value);
      return;
    }

    case "timer:write":
    case "timer:register.update": {
      switch (event.register) {
        case "CONT": {
          store.set(CONTAtom, event.value);
          return;
        }

        case "COMP": {
          store.set(COMPAtom, event.value);
          return;
        }

        default: {
          const _exhaustiveCheck: never = event.register;
          return _exhaustiveCheck;
        }
      }
    }

    case "timer:write.ok":
      return;

    case "timer:interrupt":
      return;

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
