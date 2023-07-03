import type { IOAddressLike } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import type { EventGenerator } from "../../events";
import { IOModule } from "../module";

type TimerRegister = "CONT" | "COMP";

export type TimerOperation =
  | { type: "timer:read"; register: TimerRegister }
  | { type: "timer:read.ok"; value: Byte<8> }
  | { type: "timer:write"; register: TimerRegister; value: Byte<8> }
  | { type: "timer:write.ok" }
  | { type: "timer:register.update"; register: TimerRegister; value: Byte<8> }
  | { type: "timer:interrupt" };

export class Timer extends IOModule<TimerRegister> {
  #CONT = Byte.zero(8);
  #COMP = Byte.zero(8);

  reset(): void {
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
   * Ticks the timer. Called by the clock.
   */
  *tick(): EventGenerator {
    const value = this.#CONT.unsigned === Byte.maxValue(8) ? Byte.zero(8) : this.#CONT.add(1);

    this.#CONT = value;
    yield { type: "timer:register.update", register: "CONT", value };
    if (this.#COMP.equals(value)) {
      yield { type: "timer:interrupt" };
      yield* this.computer.io.pic.interrupt(1);
    }
  }

  toJSON(): JsonValue {
    return {
      CONT: this.#CONT.toJSON(),
      COMP: this.#COMP.toJSON(),
    };
  }
}
