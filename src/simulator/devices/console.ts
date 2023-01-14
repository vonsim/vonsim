import { tdeep } from "tdeep";

import type { DeviceSlice } from "@/simulator/devices";

export type ConsoleSlice = {
  console: string;
  writeConsole: (value: string) => void;
};

export const createConsoleSlice: DeviceSlice<ConsoleSlice> = set => ({
  devices: {
    console: "",
    writeConsole: value => {
      const formFeed = value.lastIndexOf("\f");
      set(
        tdeep("devices.console", prev =>
          formFeed === -1 ? prev + value : value.slice(formFeed + 1),
        ),
      );
    },
  },
});
