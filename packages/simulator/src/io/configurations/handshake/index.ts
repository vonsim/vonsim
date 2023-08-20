import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { IORegister } from "../../../bus";
import { Component, ComponentInit } from "../../../component";
import { SimulatorError } from "../../../error";
import type { EventGenerator } from "../../../events";
import { Clock } from "../../devices/clocks";
import { F10 } from "../../devices/f10";
import { Keyboard } from "../../devices/keyboard";
import { Screen } from "../../devices/screen";
import { IOInterface } from "../../interface";
import { PIC } from "../../modules/pic";
import { Timer } from "../../modules/timer";
import { Handshake as HandshakeModule } from "./handshake";
import { Printer } from "./printer";

/**
 * `handshake` interface.
 *
 * - Devices:
 *   - {@link Clock}
 *   - {@link F10}
 *   - {@link Keyboard}
 *   - {@link Printer}
 *   - {@link Screen}
 * - Modules:
 *   - {@link HandshakeModule | Handshake}
 *   - {@link PIC}
 *   - {@link Timer}
 * ---
 * This class is: IMMUTABLE
 */
export class Handshake extends Component<"handshake"> implements IOInterface {
  // Devices
  readonly clock: Clock<"handshake">;
  readonly f10: F10<"handshake">;
  readonly keyboard: Keyboard<"handshake">;
  readonly printer: Printer;
  readonly screen: Screen<"handshake">;

  // Modules
  readonly handshake: HandshakeModule;
  readonly pic: PIC<"handshake">;
  readonly timer: Timer<"handshake">;

  constructor(options: ComponentInit<"handshake">) {
    super(options);

    this.clock = new Clock(options);
    this.f10 = new F10(options);
    this.keyboard = new Keyboard(options);
    this.printer = new Printer(options);
    this.screen = new Screen(options);

    this.handshake = new HandshakeModule(options);
    this.pic = new PIC(options);
    this.timer = new Timer(options);
  }

  *chipSelect(address: IOAddressLike): EventGenerator<IORegister | null> {
    const handshake = this.handshake.chipSelect(address);
    if (handshake) {
      yield { type: "bus:io.selected", chip: "handshake" };
      return { chip: "handshake", register: handshake };
    }

    const pic = this.pic.chipSelect(address);
    if (pic) {
      yield { type: "bus:io.selected", chip: "pic" };
      return { chip: "pic", register: pic };
    }

    const timer = this.timer.chipSelect(address);
    if (timer) {
      yield { type: "bus:io.selected", chip: "timer" };
      return { chip: "timer", register: timer };
    }

    yield { type: "bus:io.error", error: new SimulatorError("io-memory-not-connected", address) };
    return null;
  }

  *read(register: IORegister): EventGenerator<Byte<8> | null> {
    const { chip, register: reg } = register;

    if (chip === "handshake") return yield* this.handshake.read(reg);
    if (chip === "pic") return yield* this.pic.read(reg);
    if (chip === "timer") return yield* this.timer.read(reg);

    yield { type: "bus:io.error", error: new SimulatorError("device-not-connected", chip) };
    return null;
  }

  *write(register: IORegister, value: Byte<8>): EventGenerator<boolean> {
    const { chip, register: reg } = register;

    if (chip === "handshake") {
      yield* this.handshake.write(reg, value);
      return true;
    }

    if (chip === "pic") {
      yield* this.pic.write(reg, value);
      return true;
    }

    if (chip === "timer") {
      yield* this.timer.write(reg, value);
      return true;
    }

    yield { type: "bus:io.error", error: new SimulatorError("device-not-connected", chip) };
    return false;
  }

  toJSON() {
    return {
      clock: this.clock.toJSON(),
      f10: this.f10.toJSON(),
      keyboard: this.keyboard.toJSON(),
      printer: this.printer.toJSON(),
      screen: this.screen.toJSON(),

      handshake: this.handshake.toJSON(),
      pic: this.pic.toJSON(),
      timer: this.timer.toJSON(),
    } satisfies JsonObject;
  }
}
