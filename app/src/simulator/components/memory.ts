import { MemoryAddress } from "@vonsim/common/address";

import { atom, store } from "@/lib/jotai";
import { MBRAtom } from "@/simulator/components/bus";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish } from "@/simulator/state";

export const memoryAtom = atom(new Uint8Array(MemoryAddress.MAX_ADDRESS + 1));

export function handleMemoryEvent(event: SimulatorEvent<"memory:">): void {
  switch (event.type) {
    case "memory:read":
      return;

    case "memory:read.ok": {
      store.set(MBRAtom, event.value);
      return;
    }

    case "memory:write": {
      if (MemoryAddress.inRange(event.address)) {
        const address = Number(event.address);
        const value = Number(event.value);
        store.set(memoryAtom, arr => {
          arr.set([value], address);
          return arr;
        });
      }
      return;
    }

    case "memory:write.ok": {
      return;
    }

    case "memory:read.error":
    case "memory:write.error": {
      finish(event.error);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
