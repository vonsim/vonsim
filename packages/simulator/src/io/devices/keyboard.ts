import { Byte } from "@vonsim/common/byte";

import { Component } from "../../component";
import type { EventGenerator } from "../../events";

export type KeyboardEvent =
  | { type: "keyboard:listen-key" }
  | { type: "keyboard:read"; char: Byte<8> };

/**
 * This component reads characters from the keyboard and writes
 * to memory when the CPU calls an `INT 6` syscall.
 *
 * @see {@link https://vonsim.github.io/docs/io/devices/keyboard/}.
 *
 * ---
 * This class is: MUTABLE
 */
export class Keyboard<
  TDevices extends "keyboard-and-screen" | "pio-switches-and-leds" | "pio-printer" | "handshake",
> extends Component<TDevices> {
  #lastCharRead: Byte<8> | null = null;

  /**
   * Reads a character from the keyboard (outside).
   * @returns The character read as a Byte<8>.
   * @see {@link https://vonsim.github.io/docs/io/devices/keyboard/}.
   *
   * ---
   * Called by the CPU.
   */
  *readChar(): EventGenerator<Byte<8>> {
    yield { type: "keyboard:listen-key" };

    // Between the yield and the next line, the outside will call `setLastCharRead`

    const char = this.#lastCharRead;
    if (!char) {
      throw new Error("INT 6 was not given a valid 8-bit character!");
    }

    yield { type: "keyboard:read", char };

    this.#lastCharRead = null;
    return char;
  }

  /**
   * Saves a character from the keyboard (outside).
   * @returns The character read as a Byte<8>.
   * @see {@link https://vonsim.github.io/docs/io/devices/console/}.
   *
   * ---
   * Called by the outside.
   */
  setLastCharRead(char: Byte<8>) {
    this.#lastCharRead = char;
  }

  toJSON() {
    return null;
  }
}
