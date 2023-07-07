import type { CPUMicroOperation } from "./cpu/micro-ops";
import type { HandshakeOperation } from "./io/configurations/handshake/handshake";
import type { LedsEvent } from "./io/configurations/pio-switches-and-leds/leds";
import type { SwitchesEvent } from "./io/configurations/pio-switches-and-leds/switches";
import type { ClockEvent } from "./io/devices/clocks";
import type { ConsoleEvent } from "./io/devices/console";
import type { F10Event } from "./io/devices/f10";
import type { PrinterEvent } from "./io/devices/printer";
import type { ChipSelectEvent } from "./io/interface";
import type { PICOperation } from "./io/modules/pic";
import type { PIOOperation } from "./io/modules/pio";
import type { TimerOperation } from "./io/modules/timer";
import type { MemoryOperation } from "./memory";

export type SimulatorEvent =
  | ClockEvent // clock:*
  | ConsoleEvent // console:*
  | CPUMicroOperation // cpu:*
  | ChipSelectEvent // cs:*
  | F10Event // f10:*
  | HandshakeOperation // handshake:*
  | LedsEvent // leds:*
  | MemoryOperation // memory:*
  | PICOperation // pic:*
  | PIOOperation // pio:*
  | PrinterEvent // printer:*
  | SwitchesEvent // switches:*
  | TimerOperation; // timer:*

export type EventGenerator<TReturn = void> = Generator<SimulatorEvent, TReturn>;
