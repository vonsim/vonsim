import { Component } from "../../component";
import type { EventGenerator } from "../../events";

export type ClockEvent = { type: "clock:tick" };

/**
 * The clock is a device that sends a signal to the Timer module
 * at a constant rate.
 *
 * @see {@link https://vonsim.github.io/docs/io/devices/clock/}.
 *
 * ---
 * This class is: IMMUTABLE
 */
export class Clock<
  TDevices extends "pio-switches-and-leds" | "pio-printer" | "handshake",
> extends Component<TDevices> {
  /**
   * Sends a tick signal to the Timer module.
   *
   * ---
   * Called by the outside world, when the clock should tick.
   */
  *tick(): EventGenerator {
    yield { type: "clock:tick" };
    yield* this.computer.io.timer.tick();
  }

  toJSON() {
    return null;
  }
}
