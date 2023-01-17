import { Err, Ok } from "rust-optionals";
import { match } from "ts-pattern";

import type { Size } from "@/config";
import { joinLowHigh, splitLowHigh } from "@/helpers";
import type { SimulatorSlice } from "@/simulator";
import { SimulatorError, SimulatorResult } from "@/simulator/error";

import { ConsoleSlice, createConsoleSlice } from "./console";
import { createF10Slice, F10Slice } from "./f10";
import { createLedsSlice, LedsSlice } from "./leds";
import { createPICSlice, PICSlice } from "./pic";
import { createPIOSlice, PIOSlice } from "./pio";
import { createSwitchesSlice, SwitchesSlice } from "./switches";

export type DeviceSlice<T> = SimulatorSlice<{ devices: T }>;

export type DevicesSlice = {
  devices: ConsoleSlice &
    F10Slice &
    LedsSlice &
    PICSlice &
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
    ...createF10Slice(...a).devices,
    ...createLedsSlice(...a).devices,
    ...createPICSlice(...a).devices,
    ...createPIOSlice(...a).devices,
    ...createSwitchesSlice(...a).devices,

    configuration: "lights-and-switches",
    update: () => {
      const [, get] = a;

      get().devices.pic.update();
      get().devices.leds.update();
      get().devices.switches.update();
    },
  },

  getIOMemory: (address, size) => {
    const [, get] = a;

    const byte = (address: number) =>
      match<number, SimulatorResult<number>>(address)
        .with(0x20, () => Ok(get().devices.pic.EOI))
        .with(0x21, () => Ok(get().devices.pic.IMR))
        .with(0x22, () => Ok(get().devices.pic.IRR))
        .with(0x23, () => Ok(get().devices.pic.ISR))
        .with(0x24, () => Ok(get().devices.pic.INT0))
        .with(0x25, () => Ok(get().devices.pic.INT1))
        .with(0x26, () => Ok(get().devices.pic.INT2))
        .with(0x27, () => Ok(get().devices.pic.INT3))
        .with(0x28, () => Ok(get().devices.pic.INT4))
        .with(0x29, () => Ok(get().devices.pic.INT5))
        .with(0x2a, () => Ok(get().devices.pic.INT6))
        .with(0x2b, () => Ok(get().devices.pic.INT7))
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
        .with(0x20, () => Ok(set(state => void (state.devices.pic.EOI = value))))
        .with(0x21, () => Ok(set(state => void (state.devices.pic.IMR = value))))
        .with(0x22, () => Ok(set(state => void (state.devices.pic.IRR = value))))
        .with(0x23, () => Ok(set(state => void (state.devices.pic.ISR = value))))
        .with(0x24, () => Ok(set(state => void (state.devices.pic.INT0 = value))))
        .with(0x25, () => Ok(set(state => void (state.devices.pic.INT1 = value))))
        .with(0x26, () => Ok(set(state => void (state.devices.pic.INT2 = value))))
        .with(0x27, () => Ok(set(state => void (state.devices.pic.INT3 = value))))
        .with(0x28, () => Ok(set(state => void (state.devices.pic.INT4 = value))))
        .with(0x29, () => Ok(set(state => void (state.devices.pic.INT5 = value))))
        .with(0x2a, () => Ok(set(state => void (state.devices.pic.INT6 = value))))
        .with(0x2b, () => Ok(set(state => void (state.devices.pic.INT7 = value))))
        .with(0x30, () => Ok(set(state => void (state.devices.pio.PA = value))))
        .with(0x31, () => Ok(set(state => void (state.devices.pio.PB = value))))
        .with(0x32, () => Ok(set(state => void (state.devices.pio.CA = value))))
        .with(0x33, () => Ok(set(state => void (state.devices.pio.CB = value))))
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
