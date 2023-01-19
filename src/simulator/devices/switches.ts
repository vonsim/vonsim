import { pioMode } from "@/helpers";
import type { DeviceSlice } from "@/simulator/devices";

export type SwitchesSlice = {
  switches: {
    state: boolean[];
    toggle: (index: number) => void;
  };
};

export const createSwitchesSlice: DeviceSlice<SwitchesSlice> = set => ({
  devices: {
    switches: {
      state: new Array(8).fill(false),
      toggle: index =>
        set(simulator => {
          const state = !simulator.devices.switches.state[index];
          simulator.devices.switches.state[index] = state;

          if (pioMode(simulator.devices.pio.CA, index) === "input") {
            if (state) simulator.devices.pio.PA |= 1 << index;
            else simulator.devices.pio.PA &= ~(1 << index);
          }
        }),
    },
  },
});
