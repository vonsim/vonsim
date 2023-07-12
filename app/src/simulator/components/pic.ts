import { Byte } from "@vonsim/common/byte";

import { atom, store } from "@/lib/jotai";
import { MBRAtom } from "@/simulator/components/bus";
import type { SimulatorEvent } from "@/simulator/helpers";

export const IMRAtom = atom(Byte.fromUnsigned(0xff, 8));
export const IRRAtom = atom(Byte.fromUnsigned(0x00, 8));
export const ISRAtom = atom(Byte.fromUnsigned(0x00, 8));
export const linesAtom = atom(new Array<Byte<8>>(8).fill(Byte.zero(8)));

export function handlePICEvent(event: SimulatorEvent<"pic:">): void {
  switch (event.type) {
    case "pic:read":
      return;

    case "pic:read.ok": {
      store.set(MBRAtom, event.value);
      return;
    }

    case "pic:write":
    case "pic:register.update": {
      switch (event.register) {
        case "EOI": {
          // Do nothing!
          return;
        }

        case "IMR": {
          store.set(IMRAtom, event.value);
          return;
        }

        case "IRR": {
          store.set(IRRAtom, event.value);
          return;
        }

        case "ISR": {
          store.set(ISRAtom, event.value);
          return;
        }

        case "INT0":
        case "INT1":
        case "INT2":
        case "INT3":
        case "INT4":
        case "INT5":
        case "INT6":
        case "INT7": {
          const n = Number(event.register.slice(3));
          store.set(linesAtom, lines => [...lines.slice(0, n), event.value, ...lines.slice(n + 1)]);
          return;
        }

        default: {
          const _exhaustiveCheck: never = event.register;
          return _exhaustiveCheck;
        }
      }
    }

    case "pic:write.ok":
      return;

    case "pic:intr.off":
      return;

    case "pic:intr.on":
      return;

    case "pic:int.send": {
      store.set(MBRAtom, event.number);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
