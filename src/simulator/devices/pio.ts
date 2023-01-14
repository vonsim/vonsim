import { randomByte } from "~/helpers";
import type { DeviceSlice } from "~/simulator/devices";

export type PIOSlice = {
  pio: {
    configuration: "lights-and-switches" | "printer" | "printer-with-handshake";
    PA: number;
    CA: number;
    PB: number;
    CB: number;
  };
};

export const createPIOSlice: DeviceSlice<PIOSlice> = set => ({
  devices: {
    pio: {
      configuration: "lights-and-switches",
      PA: randomByte(),
      CA: randomByte(),
      PB: randomByte(),
      CB: randomByte(),
    },
  },
});
