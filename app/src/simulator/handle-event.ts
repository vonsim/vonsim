import { IOAddress, MemoryAddress } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";

import { handleBusEvent } from "./computer/bus/events";
import { handleClockEvent } from "./computer/clock/events";
import { handleCPUEvent } from "./computer/cpu/events";
import { handleF10Event } from "./computer/f10/events";
import { handleMemoryEvent } from "./computer/memory/events";
import { handlePICEvent } from "./computer/pic/events";
import { handleTimerEvent } from "./computer/timer/events";
import { handleConsoleEvent } from "./computer/unfinished/console";
import { handleHandshakeEvent } from "./computer/unfinished/handshake";
import { handleLedsEvent } from "./computer/unfinished/leds";
import { handlePIOEvent } from "./computer/unfinished/pio";
import { handlePrinterEvent } from "./computer/unfinished/printer";
import { handleSwitchesEvent } from "./computer/unfinished/switches";
import type { SimulatorEvent } from "./helpers";

const debugColors = {
  bus: "#2563eb",
  clock: "#65a30d",
  console: "#65a30d",
  cpu: "#dc2626",
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

export async function handleEvent(event: SimulatorEvent) {
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

  if (ns === "bus") return await handleBusEvent(event as SimulatorEvent<"bus:">);
  if (ns === "clock") return await handleClockEvent(event as SimulatorEvent<"clock:">);
  if (ns === "console") return handleConsoleEvent(event as SimulatorEvent<"console:">);
  if (ns === "cpu") return await handleCPUEvent(event as SimulatorEvent<"cpu:">);
  if (ns === "f10") return await handleF10Event(event as SimulatorEvent<"f10:">);
  if (ns === "handshake") return handleHandshakeEvent(event as SimulatorEvent<"handshake:">);
  if (ns === "leds") return handleLedsEvent(event as SimulatorEvent<"leds:">);
  if (ns === "memory") return await handleMemoryEvent(event as SimulatorEvent<"memory:">);
  if (ns === "pic") return await handlePICEvent(event as SimulatorEvent<"pic:">);
  if (ns === "pio") return handlePIOEvent(event as SimulatorEvent<"pio:">);
  if (ns === "printer") return handlePrinterEvent(event as SimulatorEvent<"printer:">);
  if (ns === "switches") return handleSwitchesEvent(event as SimulatorEvent<"switches:">);
  if (ns === "timer") return await handleTimerEvent(event as SimulatorEvent<"timer:">);

  throw new Error(`Unknown event type: ${event.type}`);
}
