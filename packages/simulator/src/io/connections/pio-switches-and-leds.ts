import { Byte } from "@vonsim/common/byte";

import { ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";
import { Leds } from "../devices/leds";
import { Switches } from "../devices/switches";
import { PIO, PIOPort } from "../modules/pio";

/**
 * PIO (for the switches and leds).
 *
 * @see
 * - {@link PIO}.
 * - {@link https://vonsim.github.io/docs/io/devices/switches-and-leds/}.
 *
 * ---
 * This class is: MUTABLE
 */
export class PIOSwitchesAndLeds extends PIO {
  readonly leds: Leds;
  readonly switches: Switches;

  constructor(options: ComponentInit) {
    super(options);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.leds = new (class extends Leds {})(options);
    this.switches = new (class extends Switches {
      *toggle(index: number): EventGenerator {
        yield* super.toggle(index);
        yield* self.updatePort("A");
      }
    })(options);
  }

  *updatePort(port: PIOPort): EventGenerator {
    if (port === "A") {
      const switches = this.switches.state.unsigned;
      let PA = this.PA.unsigned;
      const CA = this.CA.unsigned;

      // Since 1 = input
      // switches & CA
      // => the value of the switches in each position where the CA is 1 (input)
      // => 0 where the CA is 0 (output)
      // PA & ~CA
      // => the value of the written byte in each position where the CA is 0 (output)
      // => 0 where the CA is 1 (input)
      // So, the value of PA will be an OR of the two, since the values set by the switches
      // shall be kept only where the CA is 1 (input).

      PA = (switches & CA) | (PA & ~CA);
      if (PA !== this.PA.unsigned) {
        this.PA = Byte.fromUnsigned(PA, 8);
        yield { type: "pio:register.update", register: "PA", value: this.PA };
      }
    } else {
      let PB = this.PB.unsigned;
      const CB = this.CB.unsigned;

      // Since 0 = output
      // PB & ~CB
      // => the value of the leds in each position where the CB is 0 (output)
      // => 0 where the CB is 1 (input)
      // So, the value of PB will be that result, since the values of the LEDs
      // shall be only the ones set by the PIO, where the CB is 0 (output).

      PB = PB & ~CB;
      yield* this.leds.update(Byte.fromUnsigned(PB, 8));
    }
  }
}
