import { IOAddress, MemoryAddress } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";

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

const debugColors = {
  clock: "#65a30d",
  console: "#65a30d",
  cpu: "#dc2626",
  cs: "#2563eb",
  f10: "#65a30d",
  handshake: "#2563eb",
  leds: "#65a30d",
  memory: "#f59e0b",
  pic: "#2563eb",
  pio: "#2563eb",
  printer: "#65a30d",
  switches: "#65a30d",
  timer: "#2563eb",
};

export function handleEvent(event: SimulatorEvent) {
  const [ns, name] = event.type.split(":");

  console.group(
    `%c ${ns} %c ${name}`,
    `background: ${debugColors[ns]}; color: #fff; font-weight: bold;`,
    "background: unset; color: unset; font-weight: normal;",
  );
  for (const key in event) {
    if (key !== "type" && Object.prototype.hasOwnProperty.call(event, key)) {
      const element = event[key];
      if (element instanceof Byte) {
        console.log(
          `${key}: %c${element.toString("hex")}h %c(Byte)`,
          "color: #8b5cf6;",
          "color: #737373;",
        );
      } else if (element instanceof MemoryAddress) {
        console.log(
          `${key}: %c${element.toString()} %c(MemoryAddress)`,
          "color: #8b5cf6;",
          "color: #737373;",
        );
      } else if (element instanceof IOAddress) {
        console.log(
          `${key}: %c${element.toString()} %c(IOAddress)`,
          "color: #8b5cf6;",
          "color: #737373;",
        );
      } else if (typeof element === "number") {
        console.log(`${key}: %c${element} %c(number)`, "color: #8b5cf6;", "color: #737373;");
      } else if (typeof element === "string") {
        console.log(`${key}: %c"${element}" %c(string)`, "color: #f97316;", "color: #737373;");
      } else if (typeof element === "boolean") {
        console.log(`${key}: %c${element}`, "color: #06b6d4;");
      } else if (element === null) {
        console.log(`${key}: %cnull`, "color: #b91c1c;");
      } else {
        console.log(`${key}:`, element);
      }
    }
  }
  console.groupEnd();

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
