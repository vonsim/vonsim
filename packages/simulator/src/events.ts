import type { CPUMicroOperation } from "./cpu/micro-ops";
import type { ClockEvent } from "./io/devices/clocks";
import type { ConsoleEvent } from "./io/devices/console";
import type { F10Event } from "./io/devices/f10";
import type { LedsEvent } from "./io/devices/leds";
import type { PrinterEvent } from "./io/devices/printer";
import type { SwitchesEvent } from "./io/devices/switches";
import type { ChipSelectEvent } from "./io/interface";
import type { PICOperation } from "./io/modules/pic";
import type { PIOOperation } from "./io/modules/pio/generic";
import type { TimerOperation } from "./io/modules/timer";
import type { MemoryOperation } from "./memory";

export type SimulatorEvent =
  | ClockEvent // clock:*
  | ConsoleEvent // console:*
  | CPUMicroOperation // cpu:*
  | ChipSelectEvent // cs:*
  | F10Event // f10:*
  | LedsEvent // leds:*
  | MemoryOperation // memory:*
  | PICOperation // pic:*
  | PIOOperation // pio:*
  | PrinterEvent // printer:*
  | SwitchesEvent // switches:*
  | TimerOperation; // timer:*

export type EventGenerator<TReturn = void> = Generator<SimulatorEvent, TReturn>;
