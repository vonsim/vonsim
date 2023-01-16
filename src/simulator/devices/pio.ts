import { randomByte } from "@/helpers";
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
    pio: {
      PA: randomByte(),
      CA: randomByte(),
      PB: randomByte(),
      CB: randomByte(),
    },
  },
});
