import { anim, turnLineOff, turnLineOn } from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";
import { finish } from "@/computer/state";
import { colors } from "@/lib/tailwind";

export async function handleBusEvent(event: SimulatorEvent<"bus:">): Promise<void> {
  switch (event.type) {
    case "bus:io.selected": {
      await Promise.all([
        anim(
          { key: "bus.mem.stroke", to: colors.stone[700] },
          { duration: 1, easing: "easeInSine" },
        ),
        turnLineOn(`bus.${event.chip}`, 15),
      ]);
      return;
    }

    case "bus:io.error": {
      finish(event.error);
      return;
    }

    case "bus:reset": {
      await Promise.all([
        anim(
          [
            { key: "bus.address.stroke", to: colors.stone[700] },
            { key: "bus.data.stroke", to: colors.stone[700] },
            { key: "bus.rd.stroke", to: colors.stone[700] },
            { key: "bus.wr.stroke", to: colors.stone[700] },
          ],
          { duration: 1, easing: "easeInSine" },
        ),
        anim(
          { key: "bus.mem.stroke", to: colors.red[500] },
          { duration: 1, easing: "easeOutSine" },
        ),
        turnLineOff("bus.iom"),
        turnLineOff("bus.pic"),
        turnLineOff("bus.timer"),
        turnLineOff("bus.pio"),
      ]);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
