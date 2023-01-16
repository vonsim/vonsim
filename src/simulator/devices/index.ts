import { Err, Ok } from "rust-optionals";
import { tdeep } from "tdeep";
import { match } from "ts-pattern";

import type { Size } from "@/config";
import { joinLowHigh, splitLowHigh } from "@/helpers";
import type { SimulatorSlice } from "@/simulator";
import { SimulatorError, SimulatorResult } from "@/simulator/error";

import { ConsoleSlice, createConsoleSlice } from "./console";
import { createLedsSlice, LedsSlice } from "./leds";
import { createPIOSlice, PIOSlice } from "./pio";
import { createSwitchesSlice, SwitchesSlice } from "./switches";

export type DeviceSlice<T> = SimulatorSlice<{ devices: T }>;

export type DevicesSlice = {
  devices: ConsoleSlice &
    LedsSlice &
    PIOSlice &
    SwitchesSlice & {
      configuration: "lights-and-switches" | "printer" | "printer-with-handshake";
      update: () => void;
    };
  getIOMemory: (address: number, size: Size) => SimulatorResult<number>;
  setIOMemory: (address: number, size: Size, value: number) => SimulatorResult<void>;
};

export const createDevicesSlice: SimulatorSlice<DevicesSlice> = (...a) => ({
  devices: {
    ...createConsoleSlice(...a).devices,
    ...createLedsSlice(...a).devices,
    ...createPIOSlice(...a).devices,
    ...createSwitchesSlice(...a).devices,

    configuration: "lights-and-switches",
    update: () => {
      const [, get] = a;

      get().devices.leds.update();
      get().devices.switches.update();
    },
  },

  getIOMemory: (address, size) => {
    const [, get] = a;

    const byte = (address: number) =>
      match<number, SimulatorResult<number>>(address)
        .with(0x30, () => Ok(get().devices.pio.PA))
        .with(0x31, () => Ok(get().devices.pio.PB))
        .with(0x32, () => Ok(get().devices.pio.CA))
        .with(0x33, () => Ok(get().devices.pio.CB))
        .otherwise(() => Err(new SimulatorError("io-memory-not-implemented", address)));

    if (size === "byte") {
      return byte(address);
    } else {
      const low = byte(address);
      if (low.isErr()) return low;

      const high = byte(address + 1);
      if (high.isErr()) return high;

      return Ok(joinLowHigh(low.unwrap(), high.unwrap()));
    }
  },

  setIOMemory: (address, size, value) => {
    const [set] = a;

    const byte = (address: number, value: number) =>
      match<number, SimulatorResult<void>>(address)
        .with(0x30, () => Ok(set(tdeep("devices.pio.PA", value))))
        .with(0x31, () => Ok(set(tdeep("devices.pio.PB", value))))
        .with(0x32, () => Ok(set(tdeep("devices.pio.CA", value))))
        .with(0x33, () => Ok(set(tdeep("devices.pio.CB", value))))
        .otherwise(() => Err(new SimulatorError("io-memory-not-implemented", address)));

    if (size === "byte") {
      return byte(address, value);
    } else {
      const [low, high] = splitLowHigh(value);

      const lowResult = byte(address, low);
      if (lowResult.isErr()) return lowResult;

      return byte(address + 1, high);
    }
  },
});
