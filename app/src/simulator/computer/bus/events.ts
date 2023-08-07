import { colors } from "@/lib/tailwind";
import { anim, turnLineOff } from "@/simulator/computer/shared/animate";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish } from "@/simulator/state";

export async function handleBusEvent(event: SimulatorEvent<"bus:">): Promise<void> {
  switch (event.type) {
    case "bus:io.selected":
      return;

    case "bus:io.error": {
      finish(event.error);
      return;
    }

    case "bus:reset": {
      await Promise.all([
        anim("bus.address", { stroke: colors.stone[700] }, { duration: 1, easing: "easeInSine" }),
        anim("bus.data", { stroke: colors.stone[700] }, { duration: 1, easing: "easeInSine" }),
        turnLineOff("rd"),
        turnLineOff("wr"),
        turnLineOff("iom"),
      ]);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
