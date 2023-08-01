import { MemoryAddress } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import { atom } from "jotai";

import { store } from "@/lib/jotai";
import { MBRAtom } from "@/simulator/computer/cpu/state";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish } from "@/simulator/state";

export const memoryAtom = atom(
  new Array<Byte<8>>(MemoryAddress.MAX_ADDRESS + 1).fill(Byte.zero(8)),
);

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
        store.set(memoryAtom, arr => [
          ...arr.slice(0, address),
          event.value,
          ...arr.slice(address + 1),
        ]);
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
