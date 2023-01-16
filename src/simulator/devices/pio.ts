import type { DeviceSlice } from "@/simulator/devices";

export type PIOSlice = {
  pio: {
    PA: number;
    CA: number;
    PB: number;
    CB: number;
  };
};

export const createPIOSlice: DeviceSlice<PIOSlice> = () => ({
  devices: {
    pio: { PA: 0, CA: 0, PB: 0, CB: 0 },
  },
});
