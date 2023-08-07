import type { SimulatorError } from "./error";
import type { HandshakeRegister } from "./io/configurations/handshake/handshake";
import type { PICRegister } from "./io/modules/pic";
import type { PIORegister } from "./io/modules/pio";
import type { TimerRegister } from "./io/modules/timer";

export type IORegister =
  | { chip: "pic"; register: PICRegister }
  | { chip: "timer"; register: TimerRegister }
  | { chip: "pio"; register: PIORegister }
  | { chip: "handshake"; register: HandshakeRegister };

/**
 * Bus events, emitted by the any component that uses the bus.
 */
export type BusEvent =
  | { type: "bus:io.selected"; chip: IORegister["chip"] }
  | {
      type: "bus:io.error";
      error: SimulatorError<"io-memory-not-implemented"> | SimulatorError<"device-not-connected">;
    }
  | { type: "bus:reset" };
