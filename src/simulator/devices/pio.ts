import { bit, pioMode } from "@/helpers";
import type { DeviceSlice } from "@/simulator/devices";

type PIORegister = "PA" | "PB" | "CA" | "CB";

export type PIOSlice = {
  pio: Record<PIORegister, number> & {
    setRegister: (reg: PIORegister, value: number) => void;
  };
};

/**
 * PIO
 *
 * PA and PB are the data registers
 * CA and CB are the control registers, which determine whether the corresponding bit in PA/PB is an input or output
 *
 * When a bit of CX is 0, the corresponding bit in PX is the output value
 * When a bit of CX is 1, the corresponding bit in PX is the input value
 *
 * @see /docs/como-usar/dispositivos/pio.md
 */

export const createPIOSlice: DeviceSlice<PIOSlice> = (set, get) => ({
  devices: {
    pio: {
      PA: 0,
      PB: 0,
      CA: 0,
      CB: 0,

      /**
       * Set a PIO register
       *
       * This function is called by the CPU when it executes an OUT instruction,
       * and must not be called by other parts of the simulator (e.g. the switches
       * must update the PA register by mutating the state directly).
       *
       * The reasoning is that the PIO needs to know when the CPU writes to its
       * registers, so it can update the state of the external devices. Whereas
       * modifications made by external devices never affect the CPU directly.
       */
      setRegister: (reg, value) => {
        const config = get().devices.configuration;

        if (config === "switches-leds") {
          // PA: Switches
          // PB: Leds

          set(state => void (state.devices.pio[reg] = value));

          if (reg === "PB" || reg === "CB") {
            // Update LEDs
            const { PB, CB } = get().devices.pio;
            const leds = [...get().devices.leds.state];

            let updated = false;
            for (let i = 0; i < 8; i++) {
              if (pioMode(CB, i) !== "output") continue;

              const state = bit(PB, i);
              if (leds[i] === state) continue;

              leds[i] = state;
              updated = true;
            }

            if (updated) set(state => void (state.devices.leds.state = leds));
          }

          // Never update switches
          // For the viewpoint of the PIO, the switches are always inputs
        } else if (config === "printer-pio") {
          // PA: XXXX XXSB - S: Strobe, B: Busy
          // PB: Data

          const strobe = bit(get().devices.pio.PA, 1);
          set(state => void (state.devices.pio[reg] = value));

          if (reg === "PA") {
            // Maybe there is a rising edge on the strobe
            const { PA, CA, PB, CB } = get().devices.pio;
            if (pioMode(CA, 1) !== "output") return;

            const newStrobe = bit(PA, 1);
            if (strobe === false && newStrobe === true) {
              // Strobe is rising edge

              let char = PB;
              for (let i = 0; i < 8; i++) {
                // Filter out non-output bits
                if (pioMode(CB, i) === "output") continue;
                char &= ~(1 << i);
              }

              get().devices.printer.addToBuffer(char);
            }
          }
        }
      },
    },
  },
});
