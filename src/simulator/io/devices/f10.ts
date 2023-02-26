import type { PIC } from "./pic";

/**
 * @see /docs/como-usar/dispositivos/f10.md for more details
 */
export class F10 {
  #pic: PIC;

  constructor(pic: PIC) {
    this.#pic = pic;
  }

  press() {
    // F10 is linked to INT0
    this.#pic.request(0);
  }
}
