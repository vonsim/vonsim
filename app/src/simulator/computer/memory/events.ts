import { MemoryAddress } from "@vonsim/common/address";

import { store } from "@/lib/jotai";
import { populateDataBus } from "@/simulator/computer/shared/animate";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish } from "@/simulator/state";

import { memoryAtom, selectedAddressAtom } from "./state";

export async function handleMemoryEvent(event: SimulatorEvent<"memory:">): Promise<void> {
  switch (event.type) {
    case "memory:read": {
      if (MemoryAddress.inRange(event.address)) {
        store.set(selectedAddressAtom, MemoryAddress.from(event.address));
      }
      return;
    }

    case "memory:read.ok": {
      await populateDataBus(event.value);
      return;
    }

    case "memory:write": {
      if (MemoryAddress.inRange(event.address)) {
        const address = Number(event.address);
        store.set(selectedAddressAtom, MemoryAddress.from(event.address));
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
