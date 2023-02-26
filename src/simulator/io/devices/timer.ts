import { None, Option, Some } from "rust-optionals";
import { match } from "ts-pattern";

import { MAX_VALUE } from "@/config";
import { randomByte } from "@/helpers";
import { Clock, IORegisters, MemoryMode } from "@/simulator/common";

import type { PIC } from "./pic";

export type TimerOptions = { mode: MemoryMode };

/**
 * @see /docs/como-usar/dispositivos/timer.md for more details
 */
export class Timer implements IORegisters {
  static readonly CONT = 0x10;
  static readonly COMP = 0x11;

  #CONT = 0x00;
  #COMP = 0x00;
  #pic: PIC;
  #clock = new Clock(1);

  constructor(pic: PIC) {
    this.#pic = pic;
  }

  reset({ mode }: TimerOptions) {
    if (mode === "empty") {
      this.#CONT = 0x00;
      this.#COMP = 0xff;
    } else if (mode === "randomize") {
      this.#CONT = randomByte();
      this.#COMP = randomByte();
    }
  }

  getRegister(address: number): Option<number> {
    return match(address)
      .with(0x10, () => Some(this.#CONT))
      .with(0x11, () => Some(this.#COMP))
      .otherwise(() => None());
  }

  setRegister(address: number, value: number): Option<void> {
    return match(address)
      .with(0x10, () => Some(void (this.#CONT = value)))
      .with(0x11, () => Some(void (this.#COMP = value)))
      .otherwise(() => None());
  }

  get nextTick() {
    return this.#clock.nextTick;
  }

  tick(currentTime: number) {
    if (!this.#clock.tick(currentTime)) return;

    this.#CONT++;
    if (this.#CONT > MAX_VALUE["byte"]) this.#CONT = 0x00;

    if (this.#CONT === this.#COMP) {
      // TIMER is linked to INT1
      this.#pic.request(1);
    }
  }

  toJSON() {
    return { CONT: this.#CONT, COMP: this.#COMP };
  }
}
