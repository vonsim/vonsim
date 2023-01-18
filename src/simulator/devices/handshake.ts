import type { DeviceSlice } from "@/simulator/devices";

export type HandshakeSlice = {
  handshake: {
    data: number;
    state: number;
    riseStrobe: boolean;
    setData: (data: number) => void;
    update: () => void;
  };
};

export const createHandshakeSlice: DeviceSlice<HandshakeSlice> = (set, get) => ({
  devices: {
    handshake: {
      data: 0,
      state: 0, // XXXX XXSB, where S is strobe, B is busy
      riseStrobe: false,

      setData: data =>
        set(state => {
          state.devices.handshake.data = data;
          state.devices.handshake.state &= ~0b10; // set strobe to 0
          state.devices.handshake.riseStrobe = true;
        }),

      update: () => {
        if (get().devicesConfiguration !== "printer-handshake") return;

        if (get().devices.handshake.riseStrobe) {
          set(state => {
            state.devices.handshake.state |= 0b10; // set strobe to 1
            state.devices.handshake.riseStrobe = false;
          });
        }
      },
    },
  },
});