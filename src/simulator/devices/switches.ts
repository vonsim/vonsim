import { tdeep } from "tdeep";

import type { DeviceSlice } from "@/simulator/devices";

export type SwitchesSlice = {
  switches: {
    state: boolean[];
    update: () => void;
    toggle: (index: number) => void;
  };
};

export const createSwitchesSlice: DeviceSlice<SwitchesSlice> = (set, get) => ({
  devices: {
    switches: {
      state: Array.from({ length: 8 }, () => Math.random() > 0.5),
      update: () => {
        let PA = get().devices.pio.PA;
        const CA = get().devices.pio.CA;

        const state = get().devices.switches.state;
        let updated = false;
        for (let i = 0; i < 8; i++) {
          const mask = 0b1000_0000 >> i;

          const isInput = (CA & mask) !== 0;
          if (!isInput) continue;

          const isOn = (PA & mask) !== 0;
          if (state[i] === isOn) continue;

          PA ^= mask;
          updated = true;
        }

        if (updated) set(tdeep("devices.pio.PA", PA));
      },
      toggle: index => set(tdeep(`devices.switches.state.${index}`, state => !state)),
    },
  },
});