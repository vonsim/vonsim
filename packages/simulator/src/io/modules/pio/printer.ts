import { Byte } from "@vonsim/common/byte";

import type { EventGenerator } from "../../../events";
import { PIO, PIOPort } from "./generic";

export class PIOPrinter extends PIO {
  *updatePort(port: PIOPort): EventGenerator {
    // TODO
  }
}
