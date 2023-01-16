import { tdeep } from "tdeep";

import type { DeviceSlice } from "@/simulator/devices";

export type LedsSlice = {
  leds: {
    state: boolean[];
    update: () => void;
  };
};

export const createLedsSlice: DeviceSlice<LedsSlice> = (set, get) => ({
  devices: {
    leds: {
      state: Array.from({ length: 8 }, () => Math.random() > 0.5),
      update: () => {
        const { PB, CB } = get().devices.pio;

        const state = [...get().devices.leds.state];
        let updated = false;
        for (let i = 0; i < 8; i++) {
          const mask = 0b1000_0000 >> i;

          const isOutput = (CB & mask) === 0;
          if (!isOutput) continue;

          const isOn = (PB & mask) !== 0;
          if (state[i] === isOn) continue;

          state[i] = isOn;
          updated = true;
        }

        if (updated) set(tdeep("devices.leds.state", state));
      },
    },
  },
});
