import { Byte } from "@vonsim/common/byte";
import { atom } from "jotai";

import type { SimulatorEvent } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

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
      store.set(paperAtom, text => text + event.char);
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
