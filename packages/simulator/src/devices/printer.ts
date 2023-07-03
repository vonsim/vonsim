import { decimalToChar } from "@vonsim/common/ascii";
import type { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentReset } from "../component";
import type { EventGenerator } from "../events";

export type PrinterEvent =
  | { type: "printer:buffer.add"; char: Byte<8> }
  | { type: "printer:buffer.pop"; char: Byte<8> }
  | { type: "printer:paper.replace" }
  | { type: "printer:paper.print"; char: string };

export class Printer extends Component {
  static readonly BUFFER_SIZE = 5;

  #buffer: Byte<8>[] = [];
  #paper = "";

  reset({ memory }: ComponentReset): void {
    if (memory !== "unchanged") {
      this.#buffer = [];
      this.#paper = "";
    }
  }

  /**
   * Returns whether the buffer is full or not.
   */
  get busy() {
    return this.#buffer.length >= Printer.BUFFER_SIZE;
  }

  /**
   * Adds a character to the buffer. Called by an IO module.
   * @param char
   */
  *addToBuffer(char: Byte<8>): EventGenerator {
    if (!this.busy) {
      this.#buffer.push(char);
      yield { type: "printer:buffer.add", char };
    }
  }

  /**
   * Replaces the paper. Called by the outside.
   */
  *clear(): EventGenerator {
    this.#paper = "";
    yield { type: "printer:paper.replace" };
  }

  /**
   * Prints a character from the buffer. Called by the outside.
   * @see /docs/como-usar/dispositivos/impresora.md
   */
  *print(): EventGenerator {
    if (this.#buffer.length === 0) return;

    const [first, ...rest] = this.#buffer;
    this.#buffer = rest;
    yield { type: "printer:buffer.pop", char: first };

    if (first.unsigned === 12) {
      // Character is a form feed
      yield* this.clear();
    } else {
      const char = decimalToChar(first.unsigned)!;
      this.#paper += char;
      yield { type: "printer:paper.print", char };
    }
  }

  toJSON(): JsonValue {
    return {
      paper: this.#paper,
      buffer: [...this.#buffer.map(byte => decimalToChar(byte.unsigned))],
    };
  }
}
