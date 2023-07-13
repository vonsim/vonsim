import { decimalToChar } from "@vonsim/common/ascii";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import { Component, ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";

export type PrinterEvent =
  | { type: "printer:buffer.add"; char: Byte<8> }
  | { type: "printer:buffer.pop"; char: Byte<8> }
  | { type: "printer:data.read"; char: Byte<8> }
  | { type: "printer:busy.on" }
  | { type: "printer:busy.off" }
  | { type: "printer:strobe.on" }
  | { type: "printer:strobe.off" }
  | { type: "printer:paper.replace" }
  | { type: "printer:paper.print"; char: string };

export abstract class GenericPrinter<
  TDevices extends "pio-printer" | "handshake",
> extends Component<TDevices> {
  static readonly BUFFER_SIZE = 5;

  #buffer: Byte<8>[];
  #paper: string;
  #lastStrobe = false;

  constructor(options: ComponentInit<TDevices>) {
    super(options);
    this.computer = options.computer;
    if (options.data === "unchanged" && "printer" in options.previous.io) {
      this.#buffer = options.previous.io.printer.#buffer;
      this.#paper = options.previous.io.printer.#paper;
      this.#lastStrobe = options.previous.io.printer.#lastStrobe;
    } else {
      this.#buffer = [];
      this.#paper = "";
      this.#lastStrobe = false;
    }
  }

  /**
   * Reads a character from the data bus. Called by the printer
   * after a rising edge of the strobe.
   * @returns The character read from the data bus.
   */
  abstract readData(): EventGenerator<Byte<8>>;

  /**
   * Updates the value of the busy flag. Called by the printer
   * when the buffer changes to/from full.
   * @param busy Whether the buffer just became full or not.
   */
  abstract updateBusy(busy: boolean): EventGenerator;

  /**
   * Returns whether the buffer is full or not.
   */
  get busy() {
    return this.#buffer.length >= GenericPrinter.BUFFER_SIZE;
  }

  /**
   * Updates the value of the strobe, and if it generates
   * a rising edge, reads a character from the data bus.
   * Called by an IO module.
   * @param strobe The new value of the strobe.
   */
  *setStrobe(strobe: boolean): EventGenerator {
    const lastStrobe = this.#lastStrobe;
    if (lastStrobe === strobe) return;

    this.#lastStrobe = strobe;
    if (strobe) yield { type: "printer:strobe.on" };
    else yield { type: "printer:strobe.off" };

    const risingEdge = strobe && !lastStrobe;
    if (risingEdge && !this.busy) {
      const char = yield* this.readData();
      this.#buffer.push(char);
      yield { type: "printer:buffer.add", char };

      // Just after reading a character, the printer
      // sends a busy signal.
      // Then, it lowers it only if the buffer is empty.
      yield* this.updateBusy(true);
      if (!this.busy) yield* this.updateBusy(false);
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
    if (rest.length === GenericPrinter.BUFFER_SIZE - 1) yield* this.updateBusy(false);

    if (first.unsigned === 12) {
      // Character is a form feed
      yield* this.clear();
    } else {
      const char = decimalToChar(first.unsigned)!;
      this.#paper += char;
      yield { type: "printer:paper.print", char };
    }
  }

  toJSON() {
    return {
      paper: this.#paper,
      buffer: [...this.#buffer.map(byte => byte.unsigned)],
    } satisfies JsonObject;
  }
}
