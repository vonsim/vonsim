import { PRINTER_BUFFER_SIZE } from "@/config";
import { bit, pioMode } from "@/helpers";
import type { DeviceSlice } from "@/simulator/devices";

export type PrinterSlice = {
  printer: {
    output: string;
    buffer: string[];

    addToBuffer: (char: number) => void;
    consumeBuffer: () => void;
  };
};

export const createPrinterSlice: DeviceSlice<PrinterSlice> = (set, get) => ({
  devices: {
    printer: {
      output: "",
      buffer: [],

      addToBuffer: char => {
        const buffer = get().devices.printer.buffer;
        if (buffer.length >= PRINTER_BUFFER_SIZE) return;

        set(state => void (state.devices.printer.buffer = [...buffer, String.fromCharCode(char)]));
      },

      consumeBuffer: () => {
        let buffer = get().devices.printer.buffer.length;

        if (buffer > 0) {
          set(state => {
            const [first, ...rest] = state.devices.printer.buffer;
            state.devices.printer.buffer = rest;

            if (first === "\f") state.devices.printer.output = "";
            else state.devices.printer.output += first;
          });
          buffer--;
        }

        const config = get().devices.configuration;
        const busy = buffer >= PRINTER_BUFFER_SIZE;

        if (config === "printer-pio") {
          if (pioMode(get().devices.pio.CA, 0) !== "input") return;

          const busyBit = bit(get().devices.pio.PA, 0);
          if (busyBit === busy) return;

          set(state => {
            if (busy) state.devices.pio.PA |= 1;
            else state.devices.pio.PA &= ~1;
          });
        } else if (config === "printer-handshake") {
          const busyBit = bit(get().devices.handshake.state, 0);
          if (busyBit === busy) return;

          set(state => {
            if (busy) state.devices.handshake.state |= 1;
            else state.devices.handshake.state &= ~1;
          });
        }
      },
    },
  },
});
