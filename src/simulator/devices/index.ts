import { tdeep } from "tdeep";
import { match } from "ts-pattern";

import type { Size } from "@/config";
import { joinLowHigh, renderAddress, splitLowHigh } from "@/helpers";
import type { SimulatorSlice } from "@/simulator";

import { ConsoleSlice, createConsoleSlice } from "./console";
import { createPIOSlice, PIOSlice } from "./pio";

export type DeviceSlice<T> = SimulatorSlice<{ devices: T }>;

export type DevicesSlice = {
  devices: ConsoleSlice & PIOSlice;
  getIOMemory: (address: number, size: Size) => number;
  setIOMemory: (address: number, size: Size, value: number) => void;
};

export const createDevicesSlice: SimulatorSlice<DevicesSlice> = (...a) => ({
  devices: {
    ...createConsoleSlice(...a).devices,
    ...createPIOSlice(...a).devices,
  },

  getIOMemory: (address, size) => {
    const [, get] = a;

    const byte = (address: number) =>
      match(address)
        .with(0x30, () => get().devices.pio.PA)
        .with(0x31, () => get().devices.pio.PB)
        .with(0x32, () => get().devices.pio.CA)
        .with(0x33, () => get().devices.pio.CB)
        .otherwise(() => {
          throw new Error(
            `La dirección de memoria E/S ${renderAddress(address)} no está implementada.`,
          );
        });

    if (size === "byte") return byte(address);
    else return joinLowHigh(byte(address), byte(address + 1));
  },

  setIOMemory: (address, size, value) => {
    const [set] = a;

    const byte = (address: number, value: number) =>
      match(address)
        .with(0x30, () => set(tdeep("devices.pio.PA", value)))
        .with(0x31, () => set(tdeep("devices.pio.PB", value)))
        .with(0x32, () => set(tdeep("devices.pio.CA", value)))
        .with(0x33, () => set(tdeep("devices.pio.CB", value)))
        .otherwise(() => {
          throw new Error(
            `La dirección de memoria E/S ${renderAddress(address)} no está implementada.`,
          );
        });

    if (size === "byte") {
      byte(address, value);
    } else {
      const [low, high] = splitLowHigh(value);
      byte(address, low);
      byte(address + 1, high);
    }
  },
});
