import type { Byte } from "@vonsim/common/byte";

import type { EventGenerator } from "../../../events";
import { GenericPrinter } from "../../devices/printer";

/**
 * Printer connected to a PIO.
 *
 * @see
 * - {@link GenericPrinter}.
 * - {@link https://vonsim.github.io/docs/io/devices/printer/#imprimir-con-pio}.
 *
 * ---
 * This class is: MUTABLE
 */
export class Printer extends GenericPrinter<"pio-printer"> {
  *readData(): EventGenerator<Byte<8>> {
    const char = this.computer.io.pio.readData();
    yield { type: "printer:data.read", char };
    return char;
  }

  *updateBusy(busy: boolean): EventGenerator {
    if (busy) yield { type: "printer:busy.on" };
    else yield { type: "printer:busy.off" };
    yield* this.computer.io.pio.updatePort("A");
  }
}
