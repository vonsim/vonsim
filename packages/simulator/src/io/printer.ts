import { decimalToChar } from "@vonsim/common/ascii";
import type { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentReset } from "../component";

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

  get busy() {
    return this.#buffer.length >= Printer.BUFFER_SIZE;
  }

  addToBuffer(char: Byte<8>) {
    if (!this.busy) this.#buffer.push(char);
  }

  clean() {
    this.#paper = "";
  }

  print() {
    if (this.#buffer.length === 0) return;

    const [first, ...rest] = this.#buffer;
    this.#buffer = rest;

    const char = decimalToChar(first.unsigned);
    if (char === "\f") this.clean();
    else this.#paper += char;
  }

  toJSON(): JsonValue {
    return {
      paper: this.#paper,
      buffer: [...this.#buffer.map(byte => decimalToChar(byte.unsigned))],
    };
  }
}
