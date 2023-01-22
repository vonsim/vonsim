import { MAX_VALUE } from "@/config";
import type { DeviceSlice } from "@/simulator/devices";

export type TimerSlice = {
  timer: {
    CONT: number;
    COMP: number;
    tick: () => void;
  };
};

export const createTimerSlice: DeviceSlice<TimerSlice> = (set, get) => ({
  devices: {
    timer: {
      CONT: 0x00,
      COMP: 0x00,
      tick: () => {
        let { CONT } = get().devices.timer;
        const { COMP } = get().devices.timer;

        CONT++;
        if (CONT > MAX_VALUE["byte"]) CONT = 0x00;

        if (CONT === COMP) {
          // TIMER is linked to INT0
          get().devices.pic.request(1);
        }

        set(state => void (state.devices.timer.CONT = CONT));
      },
    },
  },
});
