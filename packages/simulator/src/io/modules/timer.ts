import type { IOAddressLike } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";
import { IOModule } from "../module";

export type TimerRegister = "CONT" | "COMP";

export type TimerOperation =
  | { type: "timer:read"; register: TimerRegister }
  | { type: "timer:read.ok"; value: Byte<8> }
  | { type: "timer:write"; register: TimerRegister; value: Byte<8> }
  | { type: "timer:write.ok" }
  | { type: "timer:register.update"; register: TimerRegister; value: Byte<8> }
  | { type: "timer:int.on" }
  | { type: "timer:int.off" };

/**
 * The timer is a module connected to a clock that interrupts the CPU
 * when a certain amount of time has passed.
 *
 * Reserved addresses:
 * - 10h: CONT
 * - 11h: COMP
 *
 * Interrupt line: INT1
 *
 * @see {@link https://vonsim.github.io/en/io/modules/timer}.
 *
 * ---
 * This class is: MUTABLE
 */
export class Timer extends IOModule<TimerRegister> {
  #CONT: Byte<8>;
  #COMP: Byte<8>;

  constructor(options: ComponentInit) {
    super(options);
    this.#CONT = Byte.zero(8);
    this.#COMP = Byte.zero(8);
  }

  chipSelect(address: IOAddressLike): TimerRegister | null {
    address = Number(address);
    if (address === 0x10) return "CONT";
    else if (address === 0x11) return "COMP";
    else return null;
  }

  *read(register: TimerRegister): EventGenerator<Byte<8>> {
    yield { type: "timer:read", register };

    let value: Byte<8>;
    if (register === "CONT") value = this.#CONT;
    else if (register === "COMP") value = this.#COMP;
    else return register; // Exhaustive check

    yield { type: "timer:read.ok", value };
    return value;
  }

  *write(register: TimerRegister, value: Byte<8>): EventGenerator {
    yield { type: "timer:write", register, value };

    if (register === "CONT") this.#CONT = value;
    else if (register === "COMP") this.#COMP = value;
    else return register; // Exhaustive check

    yield { type: "timer:register.update", register, value };
    yield { type: "timer:write.ok" };
  }

  /**
   * Ticks the timer.
   *
   * ---
   * Called by the clock.
   */
  *tick(): EventGenerator {
    const value = this.#CONT.unsigned === Byte.maxValue(8) ? Byte.zero(8) : this.#CONT.add(1);

    this.#CONT = value;
    yield { type: "timer:register.update", register: "CONT", value };
    if (this.#COMP.equals(value)) {
      yield { type: "timer:int.on" };
      if (this.computer.io.pic) yield* this.computer.io.pic.interrupt(1);
    } else {
      yield { type: "timer:int.off" };
    }
  }

  toJSON() {
    return {
      CONT: this.#CONT.toJSON(),
      COMP: this.#COMP.toJSON(),
    } satisfies JsonObject;
  }
}
