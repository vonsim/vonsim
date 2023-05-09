import type { Jsonable } from "@/simulator/common";

/**
 * @see /docs/como-usar/dispositivos/consola.md for more details
 */
export class Console implements Jsonable {
  #output = "";

  write(value: string) {
    // The form feed character (\f) is used to clear the console
    const formFeed = value.lastIndexOf("\f");
    if (formFeed === -1) this.#output += value;
    else this.#output = value.slice(formFeed + 1);

    // The backspace character (\b) is used to delete the previous character
    if (this.#output.includes("\b")) {
      this.#output = this.#output
        .split("")
        .reduce((accum, char) => (char === "\b" ? accum.slice(0, -1) : accum + char), "");
    }
  }

  clean() {
    this.#output = "";
  }

  toJSON() {
    return this.#output;
  }
}
