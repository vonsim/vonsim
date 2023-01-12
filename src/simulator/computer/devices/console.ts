import type { DeviceSlice } from ".";

export type ConsoleSlice = {
  console: string;
  writeConsole: (value: string) => void;
};

export const createConsoleSlice: DeviceSlice<ConsoleSlice> = set => ({
  devices: {
    console: "",
    writeConsole: value => {
      const formFeed = value.lastIndexOf("\f");
      set(state => {
        const console = formFeed === -1 ? state.devices.console + value : value.slice(formFeed + 1);
        return {
          devices: { ...state.devices, console },
        };
      });
    },
  },
});
