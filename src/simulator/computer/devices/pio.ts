import { randomByte } from "~/simulator/helpers";
import type { DeviceSlice } from ".";

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
