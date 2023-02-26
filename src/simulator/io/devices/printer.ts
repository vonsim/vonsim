import { PRINTER_BUFFER_SIZE } from "@/config";
import { Clock, Jsonable } from "@/simulator/common";

export type PrinterOptions = {
  speed: number;
};

/**
 * @see /docs/como-usar/dispositivos/impresora.md for more details
 */
export class Printer implements Jsonable {
  #output = "";
  #buffer: string[] = [];
  #clock = new Clock(0);

  reset({ speed }: PrinterOptions) {
    this.#buffer = [];
    this.#clock = new Clock(speed);
  }

  get busy() {
    return this.#buffer.length >= PRINTER_BUFFER_SIZE;
  }

  addToBuffer(char: number) {
    if (this.busy) return;

    this.#buffer.push(String.fromCharCode(char));
  }

  get nextTick() {
    return this.#clock.nextTick;
  }

  tick(currentTime: number) {
    if (!this.#clock.tick(currentTime)) return;

    if (this.#buffer.length === 0) return;

    const [first, ...rest] = this.#buffer;
    this.#buffer = rest;

    if (first === "\f") this.#output = "";
    else this.#output += first;
  }

  toJSON() {
    return {
      output: this.#output,
      buffer: structuredClone(this.#buffer),
    };
  }
}
