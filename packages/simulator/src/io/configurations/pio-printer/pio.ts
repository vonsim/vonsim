import { Byte } from "@vonsim/common/byte";

import type { EventGenerator } from "../../../events";
import { GenericPIO, PIOPort } from "../../modules/pio";

export class PIO extends GenericPIO<"pio-printer"> {
  *updatePort(port: PIOPort): EventGenerator {
    if (port === "B") return;
    // Handle port A

    let PA = this.PA.unsigned;
    const CA = this.CA.unsigned;
    const busy = this.computer.io.printer.busy;

    // Since 1 = input
    // PA & ~CA
    // => the value of the written byte in each position where the CA is 0 (output)
    // => 0 where the CA is 1 (input)
    // So, the value of PA will be zero where there is an input line (1) and their
    // previous value otherwise.

    PA = PA & ~CA;

    // If the busy line (0) is set as input,
    // then overwrite the value of the PA register
    if (this.line("A", 0) === "input") {
      // 0 index is already 0 beacuse of the previous operation
      if (busy) PA |= 1;
    }

    if (PA !== this.PA.unsigned) {
      this.PA = Byte.fromUnsigned(PA, 8);
      yield { type: "pio:register.update", register: "PA", value: this.PA };

      // If the strobe line (1) is set as output, then send the
      // strobe signal to the printer.
      // If the value is the same as the previous one, Printer.setStrobe
      // won't fire any event.
      if (this.line("A", 1) === "output") {
        yield* this.computer.io.printer.setStrobe(this.PA.bit(1));
      }
    }
  }

  /**
   * Returns the data as output in the B port.
   * Called by the printer when wanting to read a character.
   * @returns The data as output in the B port.
   */
  readData(): Byte<8> {
    // Since 0 = output
    // PB & ~CB
    // => the value of the byte in each position where the CB is 0 (output)
    // => 0 where the CB is 1 (input)
    // So, the value of PB will be that result, since the bits of the byte
    // transmitted shall be only the ones set by the PIO, where the CB is 0 (output).

    const out = this.PB.unsigned & ~this.CB.unsigned;
    return Byte.fromUnsigned(out, 8);
  }
}
