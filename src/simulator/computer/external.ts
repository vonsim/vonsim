import type { ComputerSlice } from ".";

export type ExternalSlice = {
  external: {
    console: string;
  };

  writeConsole: (value: string) => void;
};

export const createExternalSlice: ComputerSlice<ExternalSlice> = set => ({
  external: {
    console: "",
  },

  writeConsole: value => {
    const formFeed = value.lastIndexOf("\f");
    if (formFeed === -1) {
      set(state => ({
        external: {
          ...state.external,
          console: state.external.console + value,
          consoleInput: null,
        },
      }));
    } else {
      set(state => ({
        external: {
          ...state.external,
          console: value.slice(formFeed + 1),
          consoleInput: null,
        },
      }));
    }
  },
});
