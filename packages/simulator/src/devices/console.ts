import { decimalToChar } from "@vonsim/common/ascii";
import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentReset } from "../component";
import type { EventGenerator } from "../events";

export type ConsoleEvent = { type: "read" } | { type: "write"; char: Byte<8> };

export class Console extends Component {
  #screen = "";

  reset({ memory }: ComponentReset): void {
    if (memory === "clean") {
      this.#screen = "";
    }
  }

  get screen() {
    return this.#screen;
  }

  /**
   * Clears the screen. Called by the outside.
   */
  clear(): EventGenerator {
    // Writes a form feed character, clearing the screen
    return this.write(Byte.fromUnsigned(12, 8));
  }

  /**
   * Reads a character from the keyboard (outside). Called by the CPU.
   * @returns The character read as a Byte<8>.
   * @see /docs/como-usar/dispositivos/consola.md
   */
  *read(): EventGenerator<Byte<8>> {
    // This event must be followed by a generator.next(Byte<8>)
    const char = yield { component: "console", type: "read" };

    if (!(char instanceof Byte) || !char.is8bits()) {
      throw new Error("INT 6 was not given a valid 8-bit character!");
    }

    return char;
  }

  /**
   * Write a character to the screen. Called by the CPU.
   * @see /docs/como-usar/dispositivos/consola.md
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

    yield { component: "console", type: "write", char };
  }

  toJSON(): JsonValue {
    return this.#screen;
  }
}
