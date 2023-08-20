import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { EmptyObject } from "type-fest";

import type { IORegister } from "../../../bus";
import { Component } from "../../../component";
import { SimulatorError } from "../../../error";
import type { EventGenerator } from "../../../events";
import type { IOInterface } from "../../interface";

/**
 * `no-devices` interface.
 *
 * This IO interface has neither devices nor modules.
 *
 * ---
 * This class is: IMMUTABLE
 */
export class NoDevices extends Component<"no-devices"> implements IOInterface {
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
    return {} as EmptyObject;
  }
}
