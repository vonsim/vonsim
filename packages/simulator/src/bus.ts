import type { SimulatorError } from "./error";

/**
 * Bus events, emitted by the any component that uses the bus.
 */
export type BusEvent =
  | { type: "bus:io.selected"; chip: "handshake" | "pic" | "pio" | "timer" }
  | { type: "bus:io.error"; error: SimulatorError<"io-memory-not-implemented"> }
  | { type: "bus:reset" };
