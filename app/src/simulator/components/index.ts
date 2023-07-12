import { handleChipSelectEvent } from "@/simulator/components/chip-select";
import { handleClockEvent } from "@/simulator/components/clock";
import { handleConsoleEvent } from "@/simulator/components/console";
import { handleCPUEvent } from "@/simulator/components/cpu";
import { handleF10Event } from "@/simulator/components/f10";
import { handleHandshakeEvent } from "@/simulator/components/handshake";
import { handleLedsEvent } from "@/simulator/components/leds";
import { handleMemoryEvent } from "@/simulator/components/memory";
import { handlePICEvent } from "@/simulator/components/pic";
import { handlePIOEvent } from "@/simulator/components/pio";
import { handlePrinterEvent } from "@/simulator/components/printer";
import { handleSwitchesEvent } from "@/simulator/components/switches";
import { handleTimerEvent } from "@/simulator/components/timer";
import { SimulatorEvent } from "@/simulator/helpers";

export function handleEvent(event: SimulatorEvent) {
  const ns = event.type.split(":")[0];

  console.info(`[${event.type}]`, event);

  if (ns === "clock") return handleClockEvent(event as SimulatorEvent<"clock:">);
  if (ns === "console") return handleConsoleEvent(event as SimulatorEvent<"console:">);
  if (ns === "cpu") return handleCPUEvent(event as SimulatorEvent<"cpu:">);
  if (ns === "cs") return handleChipSelectEvent(event as SimulatorEvent<"cs:">);
  if (ns === "f10") return handleF10Event(event as SimulatorEvent<"f10:">);
  if (ns === "handshake") return handleHandshakeEvent(event as SimulatorEvent<"handshake:">);
  if (ns === "leds") return handleLedsEvent(event as SimulatorEvent<"leds:">);
  if (ns === "memory") return handleMemoryEvent(event as SimulatorEvent<"memory:">);
  if (ns === "pic") return handlePICEvent(event as SimulatorEvent<"pic:">);
  if (ns === "pio") return handlePIOEvent(event as SimulatorEvent<"pio:">);
  if (ns === "printer") return handlePrinterEvent(event as SimulatorEvent<"printer:">);
  if (ns === "switches") return handleSwitchesEvent(event as SimulatorEvent<"switches:">);
  if (ns === "timer") return handleTimerEvent(event as SimulatorEvent<"timer:">);

  throw new Error(`Unknown event type: ${event.type}`);
}
