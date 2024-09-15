import { Component } from "../../component";
import type { EventGenerator } from "../../events";

export type F10Event = { type: "f10:press" };

/**
 * The F10 key is a device that sends an interrupt to the PIC module.
 *
 * Interrupt line: INT0
 *
 * @see {@link https://vonsim.github.io/en/io/devices/f10}.
 *
 * ---
 * This class is: IMMUTABLE
 */
export class F10 extends Component {
  /**
   * Sends an interrupt to the PIC module.
   *
   * ---
   * Called by the outside world, when the F10 key is pressed.
   */
  *press(): EventGenerator {
    yield { type: "f10:press" };
    if (this.computer.io.pic) yield* this.computer.io.pic.interrupt(0);
  }

  toJSON() {
    return null;
  }
}
