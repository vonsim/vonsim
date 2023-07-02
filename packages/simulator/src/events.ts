import type { CPUMicroOperation } from "./cpu/micro-ops";
import type { ChipSelectEvent } from "./io";
import type { PICOperation } from "./io/pic";
import type { MemoryOperation } from "./memory";

export type SimulatorEvent =
  | ({ component: "cpu" } & CPUMicroOperation)
  | ({ component: "memory" } & MemoryOperation)
  | ({ component: "chip-select" } & ChipSelectEvent)
  | ({ component: "pic" } & PICOperation);

export type EventGenerator<TReturn = void> = Generator<SimulatorEvent, TReturn>;
