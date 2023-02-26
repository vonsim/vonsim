import type { Jsonable } from "@/simulator/common";

/**
 * @see /docs/como-usar/dispositivos/consola.md for more details
 */
export class Console implements Jsonable {
  #output = "";

  write(value: string) {
    const formFeed = value.lastIndexOf("\f");
    if (formFeed === -1) this.#output += value;
    else this.#output = value.slice(formFeed + 1);
  }

  toJSON() {
    return this.#output;
  }
}
