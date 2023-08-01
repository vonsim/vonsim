import { Byte } from "@vonsim/common/byte";
import { atom } from "jotai";

import { store } from "@/lib/jotai";
import type { SimulatorEvent } from "@/simulator/helpers";
import { simulator } from "@/simulator/state";

export const bufferAtom = atom<Byte<8>[]>([]);
export const paperAtom = atom("");

export function handlePrinterEvent(event: SimulatorEvent<"printer:">): void {
  switch (event.type) {
    case "printer:buffer.add": {
      store.set(bufferAtom, buffer => [...buffer, event.char]);
      return;
    }

    case "printer:buffer.pop": {
      store.set(bufferAtom, buffer => buffer.slice(1));
      return;
    }

    case "printer:busy.off":
      return;

    case "printer:busy.on":
      return;

    case "printer:data.read":
      return;

    case "printer:paper.print": {
      const io = simulator.getComputerState()!.io;
      if ("printer" in io) store.set(paperAtom, io.printer.paper);
      return;
    }

    case "printer:paper.replace": {
      store.set(paperAtom, "");
      return;
    }

    case "printer:strobe.off":
      return;

    case "printer:strobe.on":
      return;

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
