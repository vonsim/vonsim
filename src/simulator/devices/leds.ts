import { byteArray } from "@/helpers";
import type { DeviceSlice } from "@/simulator/devices";

export type LedsSlice = {
  leds: {
    state: boolean[];
  };
};

export const createLedsSlice: DeviceSlice<LedsSlice> = () => ({
  devices: {
    leds: { state: byteArray(() => false) },
  },
});
