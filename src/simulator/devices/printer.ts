import { PRINTER_BUFFER_SIZE } from "@/config";
import type { DeviceSlice } from "@/simulator/devices";

export type PrinterSlice = {
  printer: {
    output: string;
    buffer: string[];
    printerSpeed: number;
    lastStrobe: boolean;
    lastTick: number;

    update: (timeElapsed: number) => void;
  };
};

export const createPrinterSlice: DeviceSlice<PrinterSlice> = (set, get) => ({
  devices: {
    printer: {
      output: "",
      buffer: [],
      printerSpeed: 0,
      lastStrobe: false,
      lastTick: 0,

      update: timeElapsed => {
        const config = get().devicesConfiguration;

        if (config === "printer-pio") {
          const { lastTick, lastStrobe, printerSpeed } = get().devices.printer;
          const { PA, PB, CA, CB } = get().devices.pio;

          // Port A: XXXX XXSB, where S is strobe, B is busy
          // Port B: a character

          const canWriteBusyBit = (CA & 0b01) === 0b01;

          if (timeElapsed - lastTick >= printerSpeed) {
            set(state => {
              state.devices.printer.lastTick = timeElapsed;

              if (state.devices.printer.buffer.length === 0) return;
              const [first, ...rest] = state.devices.printer.buffer;
              state.devices.printer.output += first;
              state.devices.printer.buffer = rest;
              if (canWriteBusyBit) state.devices.pio.PA &= ~0b01;
            });
          }

          if (get().devices.printer.buffer.length >= PRINTER_BUFFER_SIZE) return;

          const strobe = (CA & 0b10) === 0b00 && (PA & 0b10) === 0b10;
          if (lastStrobe === false && strobe === true) {
            // Strobe is rising edge

            // Takes into account only the bits set as output. Those set as input are set to 0.
            const char = PB & ~CB;
            set(state => {
              state.devices.printer.lastStrobe = true;
              state.devices.printer.buffer = [
                ...state.devices.printer.buffer,
                String.fromCharCode(char),
              ];
              if (canWriteBusyBit && state.devices.printer.buffer.length >= PRINTER_BUFFER_SIZE) {
                state.devices.pio.PA |= 0b01;
              }
            });
          } else if (lastStrobe !== strobe) {
            // Strobe is falling edge
            set(state => {
              state.devices.printer.lastStrobe = false;
            });
          }
        }
      },
    },
  },
});
