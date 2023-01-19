import { PRINTER_BUFFER_SIZE } from "@/config";
import { pioMode } from "@/helpers";
import type { DeviceSlice } from "@/simulator/devices";

export type PrinterSlice = {
  printer: {
    output: string;
    buffer: string[];
    printerSpeed: number;
    lastTick: number;

    addToBuffer: (char: number) => void;
    update: (timeElapsed: number) => void;
  };
};

export const createPrinterSlice: DeviceSlice<PrinterSlice> = (set, get) => ({
  devices: {
    printer: {
      output: "",
      buffer: [],
      printerSpeed: 0,
      lastTick: 0,

      addToBuffer: char => {
        const buffer = get().devices.printer.buffer;
        if (buffer.length >= PRINTER_BUFFER_SIZE) return;

        set(state => void (state.devices.printer.buffer = [...buffer, String.fromCharCode(char)]));
      },

      update: timeElapsed => {
        set(state => {
          const { lastTick, printerSpeed } = state.devices.printer;

          if (timeElapsed - lastTick >= printerSpeed) {
            state.devices.printer.lastTick = timeElapsed;

            // If buffer, print first character
            if (state.devices.printer.buffer.length > 0) {
              const [first, ...rest] = state.devices.printer.buffer;
              state.devices.printer.buffer = rest;

              if (first === "\f") state.devices.printer.output = "";
              else state.devices.printer.output += first;
            }
          }

          // Set busy bit
          const busy = state.devices.printer.buffer.length >= PRINTER_BUFFER_SIZE;

          const config = state.__runnerInternal.devices;
          if (config === "printer-pio") {
            if (pioMode(state.devices.pio.CA, 0) !== "input") return;

            if (busy) state.devices.pio.PA |= 1;
            else state.devices.pio.PA &= ~1;
          } else if (config === "printer-handshake") {
            if (busy) state.devices.handshake.state |= 1;
            else state.devices.handshake.state &= ~1;
          }
        });
      },
    },
  },
});
