import type { DeviceSlice } from "@/simulator/devices";

export type F10Slice = {
  f10: {
    press: () => void;
  };
};

export const createF10Slice: DeviceSlice<F10Slice> = (set, get) => ({
  devices: {
    f10: {
      // F10 is linked to INT0
      press: () => get().devices.pic.request(0),
    },
  },
});
