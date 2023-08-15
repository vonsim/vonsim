import { turnLineOff, turnLineOn } from "@/computer/shared/animate";
import type { SimulatorEvent } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

import { bufferAtom, paperAtom } from "./state";

export async function handlePrinterEvent(event: SimulatorEvent<"printer:">): Promise<void> {
  switch (event.type) {
    case "printer:buffer.add": {
      store.set(bufferAtom, buffer => [...buffer, event.char]);
      return;
    }

    case "printer:buffer.pop": {
      store.set(bufferAtom, buffer => buffer.slice(1));
      return;
    }

    case "printer:busy.off": {
      await turnLineOff("bus.printer.busy");
      return;
    }

    case "printer:busy.on": {
      await turnLineOn("bus.printer.busy", 15);
      return;
    }

    case "printer:data.read": {
      await turnLineOn("bus.printer.data", 15);
      await turnLineOff("bus.printer.data");
      return;
    }

    case "printer:paper.print": {
      store.set(paperAtom, text => text + event.char);
      return;
    }

    case "printer:paper.replace": {
      store.set(paperAtom, "");
      return;
    }

    case "printer:strobe.off": {
      await turnLineOff("bus.printer.strobe");
      return;
    }

    case "printer:strobe.on": {
      await turnLineOn("bus.printer.strobe", 15);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
