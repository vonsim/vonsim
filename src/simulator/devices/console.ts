import { tdeep } from "tdeep";

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
        set(
          tdeep("devices.console.output", prev =>
            formFeed === -1 ? prev + value : value.slice(formFeed + 1),
          ),
        );
      },
    },
  },
});
