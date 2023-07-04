import { Byte } from "@vonsim/common/byte";

import type { EventGenerator } from "../../../events";
import type { IOPIOSwitchesAndLeds } from "../../configurations";
import { PIO, PIOPort } from "./generic";

export class PIOSwitchesAndLeds extends PIO {
  *updatePort(port: PIOPort): EventGenerator {
    if (port === "A") {
      const switches = (this.computer.io as IOPIOSwitchesAndLeds).switches.state.unsigned;
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
      // So, the value of PB willbe that result, since the values of the LEDs
      // shall be only the ones set by the PIO, where the CB is 0 (output).

      PB = PB & ~CB;
      if (PB !== this.PB.unsigned) {
        this.PB = Byte.fromUnsigned(PB, 8);
        yield { type: "pio:register.update", register: "PB", value: this.PB };
      }
    }
  }
}
