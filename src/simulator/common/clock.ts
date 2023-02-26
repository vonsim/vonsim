export class Clock {
  #lastTick: number;
  #interval: number;

  /**
   * @param speed How many ticks per second (Hz)
   */
  constructor(speed: number) {
    this.#interval = Math.round(1000 / speed);

    // Timer starts at -interval so that the first tick happens immediately
    // after the timer is started.
    this.#lastTick = -this.#interval;
  }

  get nextTick() {
    if (this.#interval <= 0) throw new Error("Malformed clock");

    return this.#lastTick + this.#interval;
  }

  tick(currentTime: number): boolean {
    if (this.#interval <= 0) throw new Error("Malformed clock");

    if (currentTime >= this.nextTick) {
      this.#lastTick = this.nextTick;
      return true;
    } else {
      return false;
    }
  }
}
