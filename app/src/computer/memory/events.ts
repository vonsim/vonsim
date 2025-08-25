import { MemoryAddress } from "@vonsim/common/address";

import { anim, populateDataBus } from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";
import { finishSimulation } from "@/computer/simulation";
import { store } from "@/lib/jotai";
import { colors } from "@/lib/tailwind";

import { memoryAtom, operatingAddressAtom } from "./state";

export async function handleMemoryEvent(event: SimulatorEvent<"memory:">): Promise<void> {
  switch (event.type) {
    case "memory:read":
      return;

    case "memory:read.ok": {
      store.set(operatingAddressAtom, MemoryAddress.from(event.address));
      await anim(
        { key: "memory.operating-cell.color", to: colors.primary1 },
        { duration: 1, easing: "easeOutQuart" },
      );
      await populateDataBus(event.value);
      await anim(
        { key: "memory.operating-cell.color", to: colors.foreground },
        { duration: 1, easing: "easeOutQuart" },
      );
      return;
    }

    case "memory:write":
      return;

    case "memory:write.ok": {
      store.set(operatingAddressAtom, MemoryAddress.from(event.address));
      await anim(
        { key: "memory.operating-cell.color", to: colors.primary1 },
        { duration: 1, easing: "easeOutQuart" },
      );
      store.set(memoryAtom, arr => [
        ...arr.slice(0, event.address.value),
        event.value,
        ...arr.slice(event.address.value + 1),
      ]);
      await anim(
        { key: "memory.operating-cell.color", to: colors.foreground },
        { duration: 1, easing: "easeOutQuart" },
      );
      return;
    }

    case "memory:read.error":
    case "memory:write.error": {
      finishSimulation(event.error);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
