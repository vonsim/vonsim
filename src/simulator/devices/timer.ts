import { MAX_VALUE } from "@/config";
import type { DeviceSlice } from "@/simulator/devices";

export type TimerSlice = {
  timer: {
    CONT: number;
    COMP: number;
    lastTick: number;
    update: (timeElapsed: number) => void;
  };
};

export const createTimerSlice: DeviceSlice<TimerSlice> = (set, get) => ({
  devices: {
    timer: {
      CONT: 0x00,
      COMP: 0x00,
      lastTick: 0,
      update: timeElapsed => {
        let { CONT } = get().devices.timer;
        const { COMP, lastTick } = get().devices.timer;

        // It could happen that the timer needs to tick multiple times,
        // although this is unlikely.
        const ticks = Math.floor((timeElapsed - lastTick) / 1000);
        if (ticks === 0) return;

        for (let i = 0; i < ticks; i++) {
          CONT++;
          if (CONT > MAX_VALUE["byte"]) CONT = 0x00;

          if (CONT === COMP) {
            // TIMER is linked to INT0
            get().devices.pic.request(1);
          }
        }

        set(state => {
          state.devices.timer.CONT = CONT;
          state.devices.timer.lastTick = timeElapsed;
        });
      },
    },
  },
});
