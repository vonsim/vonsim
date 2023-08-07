import { colors } from "@/lib/tailwind";
import { anim, turnLineOff, turnLineOn } from "@/simulator/computer/shared/animate";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish } from "@/simulator/state";

export async function handleBusEvent(event: SimulatorEvent<"bus:">): Promise<void> {
  switch (event.type) {
    case "bus:io.selected": {
      await Promise.all([
        anim("bus.mem", { stroke: colors.stone[700] }, { duration: 1, easing: "easeInSine" }),
        turnLineOn(event.chip, 15),
      ]);
      return;
    }

    case "bus:io.error": {
      finish(event.error);
      return;
    }

    case "bus:reset": {
      const stroke = { stroke: colors.stone[700] };
      const config = { duration: 1, easing: "easeInSine" } as const;
      await Promise.all([
        anim("bus.address", stroke, config),
        anim("bus.data", stroke, config),
        anim("bus.rd", stroke, config),
        anim("bus.wr", stroke, config),
        turnLineOff("iom"),
        anim("bus.mem", { stroke: colors.red[500] }, { duration: 1, easing: "easeOutSine" }),
        turnLineOff("pic"),
      ]);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
