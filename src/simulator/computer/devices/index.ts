import type { ComputerSlice } from "..";
import { ConsoleSlice, createConsoleSlice } from "./console";

export type DeviceSlice<T> = ComputerSlice<{ devices: T }>;

export type DevicesSlice = {
  devices: ConsoleSlice;
};

export const createDevicesSlice: ComputerSlice<DevicesSlice> = (...a) => ({
  devices: {
    ...createConsoleSlice(...a).devices,
  },
});
