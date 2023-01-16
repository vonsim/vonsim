import { Err, Ok } from "rust-optionals";
import { tdeep } from "tdeep";
import { isMatching } from "ts-pattern";

import { interruptPattern } from "@/compiler/common/patterns";
import { INTERRUPT_VECTOR_ADDRESS_SIZE } from "@/config";
import type { DeviceSlice } from "@/simulator/devices";
import { SimulatorError, SimulatorResult } from "@/simulator/error";

type IntN = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type PICSlice = {
  pic: {
    EOI: number;
    IMR: number;
    IRR: number;
    ISR: number;
    request: (n: IntN) => void;
    update: () => void;
  } & { [key in `INT${IntN}`]: number };
};

export const createPICSlice: DeviceSlice<PICSlice> = (set, get) => ({
  devices: {
    pic: {
      EOI: 0b0000_0000,
      IMR: 0b1111_1111,
      IRR: 0b0000_0000,
      ISR: 0b0000_0000,
      INT0: 0x10,
      INT1: 0x11,
      INT2: 0x12,
      INT3: 0x13,
      INT4: 0x14,
      INT5: 0x15,
      INT6: 0x16,
      INT7: 0x17,

      request: (n: IntN) => {
        const mask = 1 << n;
        set(tdeep("devices.pic.IRR", (IRR: number) => IRR | mask));
      },

      update: (): SimulatorResult<void> => {
        const { EOI, IMR, IRR, ISR } = get().devices.pic;

        if (ISR !== 0) {
          // There is an interrupt being executed
          if (EOI === 0x20) {
            // End of interrupt
            set(state => ({
              devices: { ...state.devices, pic: { ...state.devices.pic, EOI: 0, ISR: 0 } },
            }));
          }
          return Ok();
        }

        for (let i: IntN = 0; i < 8; i++) {
          const mask = 1 << i;

          const isEnabled = (IMR & mask) === 0;
          if (!isEnabled) continue;

          const isRequested = (IRR & mask) !== 0;
          if (!isRequested) continue;

          // Run interrupt

          const ID = get().devices.pic[`INT${i}`];
          if (isMatching(interruptPattern, ID)) {
            return Err(new SimulatorError("reserved-interrupt", ID));
          }

          set(state => ({
            devices: {
              ...state.devices,
              pic: { ...state.devices.pic, EOI: 0, IRR: IRR ^ mask, ISR: mask },
            },
          }));

          const address = get().getMemory(ID * INTERRUPT_VECTOR_ADDRESS_SIZE, "word");
          if (address.isErr()) return Err(address.unwrapErr());

          const flags = get().pushToStack(get().encodeFlags());
          if (flags.isErr()) return Err(flags.unwrapErr());

          const IP = get().pushToStack(get().registers.IP);
          if (IP.isErr()) return Err(IP.unwrapErr());

          get().setRegister("IP", address.unwrap());

          return Ok();
        }

        return Ok();
      },
    },
  },
});
