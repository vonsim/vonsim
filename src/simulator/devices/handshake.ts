import { bit } from "@/helpers";
import type { DeviceSlice } from "@/simulator/devices";

export type HandshakeSlice = {
  handshake: {
    data: number;
    state: number;
    setData: (data: number) => void;
    update: () => void;
  };
};

export const createHandshakeSlice: DeviceSlice<HandshakeSlice> = (set, get) => ({
  devices: {
    handshake: {
      data: 0,
      state: 0, // IXXX XXSB, where I is interrupt, S is strobe, B is busy

      setData: data => {
        if (get().__runnerInternal.devices !== "printer-handshake") return;
        set(state => {
          state.devices.handshake.data = data;
          state.devices.handshake.state |= 0b10; // set strobe to 1
        });
      },

      update: () => {
        if (get().__runnerInternal.devices !== "printer-handshake") return;

        const { data, state } = get().devices.handshake;

        if (bit(state, 1)) {
          set(state => void (state.devices.handshake.state &= ~0b10));
          get().devices.printer.addToBuffer(data);
          return; // don't try to interrupt if data was just sent
        }

        const interruptEnabled = bit(state, 7);
        const printerIsBusy = bit(state, 0);

        // Hanshaked is linked to INT2
        if (interruptEnabled && !printerIsBusy) get().devices.pic.request(2);
        else get().devices.pic.cancel(2);
      },
    },
  },
});
