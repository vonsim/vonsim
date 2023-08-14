import { decimalToChar } from "@vonsim/common/ascii";
import { Byte } from "@vonsim/common/byte";

import { Component, ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";

export type ConsoleEvent =
  | { type: "console:read" }
  | { type: "console:write"; char: Byte<8>; screen: string };

/**
 * The console is a device that prints characters to a screen
 * and reads characters from a keyboard.
 *
 * The only way to interact with the console is through the CPU
 * with `INT 6` and `INT 7` instructions.
 *
 * @see {@link https://vonsim.github.io/docs/io/devices/console/}.
 *
 * ---
 * This class is: MUTABLE
 */
export class Console extends Component {
  #screen: string;
  #lastCharRead: Byte<8> | null = null;

  constructor(options: ComponentInit) {
    super(options);
    if (options.data === "unchanged") {
      this.#screen = options.previous.io.console.#screen;
    } else {
      this.#screen = "";
    }
  }

  get screen() {
    return this.#screen;
  }

  /**
   * Clears the screen.
   *
   * ---
   * Called by the outside.
   */
  clear(): EventGenerator {
    // Writes a form feed character, clearing the screen
    return this.write(Byte.fromUnsigned(12, 8));
  }

  /**
   * Reads a character from the keyboard (outside).
   * @returns The character read as a Byte<8>.
   * @see {@link https://vonsim.github.io/docs/io/devices/console/}.
   *
   * ---
   * Called by the CPU.
   */
  *read(): EventGenerator<Byte<8>> {
    yield { type: "console:read" };

    // Between the yield and the next line, the outside will call `setLastCharRead`

    const char = this.#lastCharRead;
    if (!char) {
      throw new Error("INT 6 was not given a valid 8-bit character!");
    }

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

  /**
   * Write a character to the screen.
   * @see {@link https://vonsim.github.io/docs/io/devices/console/}.
   *
   * ---
   * Called by the CPU.
   */
  *write(char: Byte<8>): EventGenerator {
    switch (char.unsigned) {
      case 8: // Backspace
        this.#screen = this.#screen.slice(0, -1);
        break;

      case 10: // Line feed
        this.#screen += "\n";
        break;

      case 12: // Form feed
        this.#screen = "";
        break;

      default:
        this.#screen += decimalToChar(char.unsigned);
        break;
    }

    yield { type: "console:write", char, screen: this.#screen };
  }

  toJSON() {
    return this.#screen;
  }
}
