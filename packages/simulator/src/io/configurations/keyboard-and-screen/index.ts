import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { IORegister } from "../../../bus";
import { Component, ComponentInit } from "../../../component";
import { SimulatorError } from "../../../error";
import type { EventGenerator } from "../../../events";
import { Keyboard } from "../../devices/keyboard";
import { Screen } from "../../devices/screen";
import { IOInterface } from "../../interface";

/**
 * `keyboard-and-screen` interface.
 *
 * - Devices:
 *   - {@link Keyboard}
 *   - {@link Screen}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class KeyboardAndScreen extends Component<"keyboard-and-screen"> implements IOInterface {
  // Devices
  readonly keyboard: Keyboard<"keyboard-and-screen">;
  readonly screen: Screen<"keyboard-and-screen">;

  constructor(options: ComponentInit<"keyboard-and-screen">) {
    super(options);

    this.keyboard = new Keyboard(options);
    this.screen = new Screen(options);
  }

  *chipSelect(address: IOAddressLike): EventGenerator<IORegister | null> {
    yield { type: "bus:io.error", error: new SimulatorError("io-memory-not-connected", address) };
    return null;
  }

  *read(register: IORegister): EventGenerator<Byte<8> | null> {
    yield {
      type: "bus:io.error",
      error: new SimulatorError("device-not-connected", register.chip),
    };
    return null;
  }

  *write(register: IORegister): EventGenerator<boolean> {
    yield {
      type: "bus:io.error",
      error: new SimulatorError("device-not-connected", register.chip),
    };
    return false;
  }

  toJSON() {
    return {
      keyboard: this.keyboard.toJSON(),
      screen: this.screen.toJSON(),
    } satisfies JsonObject;
  }
}
