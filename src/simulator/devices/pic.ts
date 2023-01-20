import { Err, Ok } from "rust-optionals";
import { isMatching } from "ts-pattern";

import { interruptPattern } from "@/compiler/common/patterns";
import { INTERRUPT_VECTOR_ADDRESS_SIZE } from "@/config";
import { bit, ByteRange } from "@/helpers";
import type { DeviceSlice } from "@/simulator/devices";
import { SimulatorError, SimulatorResult } from "@/simulator/error";

type PICRegister = "EOI" | "IMR" | "IRR" | "ISR" | `INT${ByteRange}`;

export type PICSlice = {
  pic: Record<PICRegister, number> & {
    request: (n: ByteRange) => void;
    cancel: (n: ByteRange) => void;
    update: () => SimulatorResult<void>;
  };
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

      request: n => {
        const mask = 1 << n;
        set(state => void (state.devices.pic.IRR |= mask));
      },

      cancel: n => {
        const mask = 1 << n;
        set(state => void (state.devices.pic.IRR &= ~mask));
      },

      update: () => {
        const { EOI, IMR, IRR, ISR } = get().devices.pic;

        if (ISR !== 0) {
          // There is an interrupt being executed
          if (EOI === 0x20) {
            // End of interrupt
            set(state => {
              state.devices.pic.EOI = 0b0000_0000;
              state.devices.pic.ISR = 0b0000_0000;
            });
          }
          return Ok();
        }

        if (!get().interruptsEnabled) return Ok();

        for (let i: ByteRange = 0; i < 8; i++) {
          const isMasked = bit(IMR, i);
          if (isMasked) continue;

          const isRequested = bit(IRR, i);
          if (!isRequested) continue;

          // Run interrupt

          const ID = get().devices.pic[`INT${i}`];
          if (isMatching(interruptPattern, ID)) {
            return Err(new SimulatorError("reserved-interrupt", ID));
          }

          set(state => {
            state.devices.pic.EOI = 0b0000_0000;
            state.devices.pic.IRR ^= 1 << i;
            state.devices.pic.ISR = 1 << i;
          });

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
