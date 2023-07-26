import type { Byte } from "@vonsim/common/byte";

import type { EventGenerator } from "../../../events";
import { GenericPrinter } from "../../devices/printer";

/**
 * Printer connected to a Handshake.
 *
 * @see
 * - {@link GenericPrinter}.
 * - {@link https://vonsim.github.io/docs/io/devices/printer/#imprimir-con-handshake}.
 *
 * ---
 * This class is: MUTABLE
 */
export class Printer extends GenericPrinter<"handshake"> {
  *readData(): EventGenerator<Byte<8>> {
    const char = this.computer.io.handshake.DATA;
    yield { type: "printer:data.read", char };
    return char;
  }

  *updateBusy(busy: boolean): EventGenerator {
    if (busy) yield { type: "printer:busy.on" };
    else yield { type: "printer:busy.off" };
    yield* this.computer.io.handshake.updateBusy(busy);
  }
}
