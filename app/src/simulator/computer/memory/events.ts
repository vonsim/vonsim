import { MemoryAddress } from "@vonsim/common/address";

import { store } from "@/lib/jotai";
import { colors } from "@/lib/tailwind";
import { MBRAtom } from "@/simulator/computer/cpu/state";
import { anim } from "@/simulator/computer/references";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish } from "@/simulator/state";

import { memoryAtom, selectedAddressAtom } from "./state";

const turnLineOn = (line: "rd" | "wr" | "iom") =>
  anim(
    `cpu.${line}`,
    { from: { strokeDashoffset: 1, opacity: 1 }, to: { strokeDashoffset: 0 } },
    { duration: 30, easing: "easeInOutSine" },
  );

const turnLineOff = (line: "rd" | "wr" | "iom") =>
  anim(`cpu.${line}`, { opacity: 0 }, { duration: 1, easing: "easeInSine" });

const clearBus = () =>
  Promise.all([
    anim("bus.mar", { stroke: colors.stone[700] }, { duration: 1, easing: "easeInSine" }),
    anim("bus.mbr", { stroke: colors.stone[700] }, { duration: 1, easing: "easeInSine" }),
  ]);

export async function handleMemoryEvent(event: SimulatorEvent<"memory:">): Promise<void> {
  switch (event.type) {
    case "memory:read": {
      await turnLineOn("rd");
      if (MemoryAddress.inRange(event.address)) {
        store.set(selectedAddressAtom, MemoryAddress.from(event.address));
      }
      return;
    }

    case "memory:read.ok": {
      await anim("bus.mbr", { stroke: colors.amber[500] }, { duration: 5, easing: "easeInSine" });
      store.set(MBRAtom, event.value);
      await clearBus();
      await turnLineOff("rd");
      return;
    }

    case "memory:write": {
      await turnLineOn("wr");
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
      await clearBus();
      await turnLineOff("wr");
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
