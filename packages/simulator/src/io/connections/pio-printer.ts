import { Byte } from "@vonsim/common/byte";

import type { ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";
import { Printer } from "../devices/printer";
import { PIO, PIOPort } from "../modules/pio";

/**
 * PIO (for the printer).
 *
 * @see
 * - {@link PIO}.
 * - {@link https://vonsim.github.io/en/io/devices/printer#printing-with-pio}.
 *
 * ---
 * This class is: MUTABLE
 */
export class PIOPrinter extends PIO {
  readonly printer: Printer;

  constructor(options: ComponentInit) {
    super(options);
    // Strobe line always starts as low
    this.PA = this.PA.withBit(1, false);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.printer = new (class extends Printer {
      *readData(): EventGenerator<Byte<8>> {
        const char = self.readData();
        yield { type: "printer:data.read", char };
        return char;
      }

      *updateBusy(busy: boolean): EventGenerator {
        if (busy) yield { type: "printer:busy.on" };
        else yield { type: "printer:busy.off" };
        yield* self.updatePort("A");
      }
    })(options);
  }

  /**
   * Returns the data as output in the B port.
   * @returns The data as output in the B port.
   *
   * ---
   * Called by the printer after the strobe signal is sent.
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

  *updatePort(port: PIOPort): EventGenerator {
    if (port === "B") return;
    // Handle port A

    let PA = this.PA.unsigned;
    const CA = this.CA.unsigned;
    const busy = this.printer.busy;

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
    }

    // If the strobe line (1) is set as output, then send the
    // strobe signal to the printer.
    // If the value is the same as the previous one, Printer.setStrobe
    // won't fire any event.
    if (this.line("A", 1) === "output") {
      yield* this.printer.setStrobe(this.PA.bit(1));
    }
  }
}
