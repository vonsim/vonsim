import type { DeviceSlice } from "@/simulator/devices";

export type LedsSlice = {
  leds: {
    state: boolean[];
  };
};

export const createLedsSlice: DeviceSlice<LedsSlice> = () => ({
  devices: {
    leds: {
      state: new Array(8).fill(false),
    },
  },
});
