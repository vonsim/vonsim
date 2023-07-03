import type { IOAddressLike } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import type { ComponentReset } from "../../../component";
import type { EventGenerator } from "../../../events";
import { IOModule } from "../../module";

export type PIOPort = "A" | "B";
export type PIORegister = `P${PIOPort}` | `C${PIOPort}`;

export type PIOOperation =
  | { type: "pio:read"; register: PIORegister }
  | { type: "pio:read.ok"; value: Byte<8> }
  | { type: "pio:write"; register: PIORegister; value: Byte<8> }
  | { type: "pio:write.ok" }
  | { type: "pio:register.update"; register: PIORegister; value: Byte<8> };

export abstract class PIO extends IOModule<PIORegister> {
  protected PA = Byte.zero(8);
  protected PB = Byte.zero(8);
  protected CA = Byte.zero(8);
  protected CB = Byte.zero(8);

  reset({ memory }: ComponentReset): void {
    if (memory === "clean") {
      this.PA = Byte.zero(8);
      this.PB = Byte.zero(8);
      this.CA = Byte.zero(8);
      this.CB = Byte.zero(8);
    } else if (memory === "randomize") {
      this.PA = Byte.random(8);
      this.PB = Byte.random(8);
      this.CA = Byte.random(8);
      this.CB = Byte.random(8);
    }
  }

  chipSelect(address: IOAddressLike): PIORegister | null {
    address = Number(address);
    if (address === 0x30) return "PA";
    else if (address === 0x31) return "PB";
    else if (address === 0x32) return "CA";
    else if (address === 0x33) return "CB";
    else return null;
  }

  *read(register: PIORegister): EventGenerator<Byte<8>> {
    yield { type: "pio:read", register };

    let value: Byte<8>;
    if (register === "PA") value = this.PA;
    else if (register === "PB") value = this.PB;
    else if (register === "CA") value = this.CA;
    else if (register === "CB") value = this.CB;
    else return register; // Exhaustive check

    yield { type: "pio:read.ok", value };
    return value;
  }

  *write(register: PIORegister, value: Byte<8>): EventGenerator {
    yield { type: "pio:write", register, value };

    if (register === "PA") this.PA = value;
    else if (register === "PB") this.PB = value;
    else if (register === "CA") this.CA = value;
    else if (register === "CB") this.CB = value;
    else return register; // Exhaustive check

    yield { type: "pio:register.update", register, value };

    if (register === "PA" || register === "CA") yield* this.updatePort("A");
    else yield* this.updatePort("B");

    yield { type: "pio:write.ok" };
  }

  /**
   * Updates the state of the port, according to the device connected to it
   * and the state of the PIO. Called by the device connected to the port and
   * this.write().
   */
  abstract updatePort(port: PIOPort): EventGenerator;

  /**
   * @param port The port to check.
   * @param index Which line to check (0-7).
   * @returns Whether the line is input or output.
   * @see /docs/como-usar/dispositivos/pio.md
   */
  line(port: PIOPort, index: number): "input" | "output" {
    // 0 = output, 1 = input
    if (port === "A") return this.CA.bit(index) ? "input" : "output";
    else return this.CB.bit(index) ? "input" : "output";
  }

  toJSON(): JsonValue {
    return {
      PA: this.PA.toJSON(),
      PB: this.PB.toJSON(),
      CA: this.CA.toJSON(),
      CB: this.CB.toJSON(),
    };
  }
}
