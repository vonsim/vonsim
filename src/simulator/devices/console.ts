import type { DeviceSlice } from "@/simulator/devices";

export type ConsoleSlice = {
  console: {
    output: string;
    write: (value: string) => void;
  };
};

export const createConsoleSlice: DeviceSlice<ConsoleSlice> = set => ({
  devices: {
    console: {
      output: "",
      write: value => {
        const formFeed = value.lastIndexOf("\f");
        set(state => {
          if (formFeed === -1) {
            state.devices.console.output += value;
          } else {
            state.devices.console.output = value.slice(formFeed + 1);
          }
        });
      },
    },
  },
});
