import type { Byte } from "@vonsim/common/byte";

import { store } from "@/lib/jotai";
import { colors } from "@/lib/tailwind";
import { MBRAtom } from "@/simulator/computer/cpu/state";
import { anim } from "@/simulator/computer/references";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish } from "@/simulator/state";

export async function populateDataBus(data: Byte<8>) {
  await anim("bus.data", { stroke: colors.amber[500] }, { duration: 5, easing: "easeOutSine" });
  await anim(
    "cpu.MBR",
    { backgroundColor: colors.mantis[500] },
    { duration: 1, easing: "easeOutQuart" },
  );
  store.set(MBRAtom, data);
  await anim(
    "cpu.MBR",
    { backgroundColor: colors.stone[800] },
    { duration: 1, easing: "easeOutQuart" },
  );
}

export async function handleBusEvent(event: SimulatorEvent<"bus:">): Promise<void> {
  switch (event.type) {
    case "bus:io.selected":
      return;

    case "bus:io.error": {
      finish(event.error);
      return;
    }

    case "bus:reset": {
      const config = { duration: 1, easing: "easeInSine" } as const;
      await Promise.all([
        anim("bus.address", { stroke: colors.stone[700] }, config),
        anim("bus.data", { stroke: colors.stone[700] }, config),
        anim("cpu.rd", { opacity: 0 }, config),
        anim("cpu.wr", { opacity: 0 }, config),
        anim("cpu.iom", { opacity: 0 }, config),
      ]);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
