import type { CPUMicroOperation } from "./cpu/micro-ops";
import type { ClockEvent } from "./devices/clocks";
import type { ConsoleEvent } from "./devices/console";
import type { F10Event } from "./devices/f10";
import type { LedsEvent } from "./devices/leds";
import type { PrinterEvent } from "./devices/printer";
import type { SwitchesEvent } from "./devices/switches";
import type { ChipSelectEvent } from "./io";
import type { PICOperation } from "./io/modules/pic";
import type { PIOOperation } from "./io/modules/pio/generic";
import type { TimerOperation } from "./io/modules/timer";
import type { MemoryOperation } from "./memory";

export type SimulatorEvent =
  | ({ component: "cpu" } & CPUMicroOperation)
  | ({ component: "memory" } & MemoryOperation)
  | ({ component: "chip-select" } & ChipSelectEvent)
  | ({ component: "console" } & ConsoleEvent)
  | ({ component: "clock" } & ClockEvent)
  | ({ component: "f10" } & F10Event)
  | ({ component: "leds" } & LedsEvent)
  | ({ component: "switches" } & SwitchesEvent)
  | ({ component: "pic" } & PICOperation)
  | ({ component: "pio" } & PIOOperation)
  | ({ component: "timer" } & TimerOperation)
  | ({ component: "printer" } & PrinterEvent);

export type EventGenerator<TReturn = void> = Generator<SimulatorEvent, TReturn>;
