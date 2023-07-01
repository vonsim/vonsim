import type { CPUMicroOperation } from "./cpu/event";
import type { ChipSelectEvent } from "./io";
import type { PICOperation } from "./io/pic";
import type { MemoryOperation } from "./memory";

export type SimulatorEvent =
  | ({ chip: "cpu" } & CPUMicroOperation)
  | ({ chip: "memory" } & MemoryOperation)
  | ({ chip: "chip-select" } & ChipSelectEvent)
  | ({ chip: "pic" } & PICOperation);

export type EventGenerator<TReturn = void> = Generator<SimulatorEvent, TReturn>;
