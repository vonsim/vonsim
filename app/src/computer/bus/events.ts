import { anim, turnLineOff, turnLineOn } from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";
import { finishSimulation } from "@/computer/simulation";
import { colors } from "@/lib/tailwind";

export async function handleBusEvent(event: SimulatorEvent<"bus:">): Promise<void> {
  switch (event.type) {
    case "bus:io.selected": {
      await Promise.all([
        anim(
          { key: "bus.mem.stroke", to: colors.background2 },
          { duration: 1, easing: "easeInSine" },
        ),
        turnLineOn(`bus.${event.chip}`, 15),
      ]);
      return;
    }

    case "bus:io.error": {
      finishSimulation(event.error);
      return;
    }

    case "bus:reset": {
      await Promise.all([
        anim(
          [
            { key: "bus.address.stroke", to: colors.background2 },
            { key: "bus.data.stroke", to: colors.background2 },
            { key: "bus.rd.stroke", to: colors.background2 },
            { key: "bus.wr.stroke", to: colors.background2 },
          ],
          { duration: 1, easing: "easeInSine" },
        ),
        anim({ key: "bus.mem.stroke", to: colors.red500 }, { duration: 1, easing: "easeOutSine" }),
        turnLineOff("bus.iom"),
        turnLineOff("bus.handshake"),
        turnLineOff("bus.pio"),
        turnLineOff("bus.pic"),
        turnLineOff("bus.timer"),
      ]);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
