import { IOAddress, MemoryAddress } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import type { Split } from "type-fest";

import { handleBusEvent } from "./bus/events";
import { handleClockEvent } from "./clock/events";
import { handleCPUEvent } from "./cpu/events";
import { handleF10Event } from "./f10/events";
import { handleKeyboardEvent } from "./keyboard/events";
import { handleLedsEvent } from "./leds/events";
import { handleMemoryEvent } from "./memory/events";
import { handlePICEvent } from "./pic/events";
import { handlePIOEvent } from "./pio/events";
import { handlePrinterEvent } from "./printer/events";
import { handleScreenEvent } from "./screen/events";
import type { SimulatorEvent } from "./shared/types";
import { handleSwitchesEvent } from "./switches/events";
import { handleTimerEvent } from "./timer/events";
import { handleHandshakeEvent } from "./unfinished/handshake";

type EventType = SimulatorEvent["type"];

const runningEvents = new Set<EventType>();

export async function handleEvent(event: SimulatorEvent) {
  // NOTE: import.meta.env.DEV can be checked to automatically
  // remove this call. However, it's OK to keep it in production
  // for now ;)
  detailedLog(event);

  const [ns] = event.type.split(":", 2) as Split<EventType, ":">;

  runningEvents.add(event.type);

  switch (ns) {
    case "bus": {
      await handleBusEvent(event as SimulatorEvent<"bus:">);
      break;
    }

    case "clock": {
      await handleClockEvent(event as SimulatorEvent<"clock:">);
      break;
    }

    case "cpu": {
      await handleCPUEvent(event as SimulatorEvent<"cpu:">);
      break;
    }

    case "f10": {
      await handleF10Event(event as SimulatorEvent<"f10:">);
      break;
    }

    case "handshake": {
      await handleHandshakeEvent(event as SimulatorEvent<"handshake:">);
      break;
    }

    case "keyboard": {
      await handleKeyboardEvent(event as SimulatorEvent<"keyboard:">);
      break;
    }

    case "leds": {
      await handleLedsEvent(event as SimulatorEvent<"leds:">);
      break;
    }

    case "memory": {
      await handleMemoryEvent(event as SimulatorEvent<"memory:">);
      break;
    }

    case "pic": {
      await handlePICEvent(event as SimulatorEvent<"pic:">);
      break;
    }

    case "pio": {
      await handlePIOEvent(event as SimulatorEvent<"pio:">);
      break;
    }

    case "printer": {
      await handlePrinterEvent(event as SimulatorEvent<"printer:">);
      break;
    }

    case "screen": {
      await handleScreenEvent(event as SimulatorEvent<"screen:">);
      break;
    }

    case "switches": {
      await handleSwitchesEvent(event as SimulatorEvent<"switches:">);
      break;
    }

    case "timer": {
      await handleTimerEvent(event as SimulatorEvent<"timer:">);
      break;
    }

    default: {
      const _exhaustiveCheck: never = ns;
      return _exhaustiveCheck;
    }
  }

  runningEvents.delete(event.type);
}

/**
 * Returs whether any of the events specified is running
 */
export function eventIsRunning(...events: EventType[]): boolean {
  for (const event of events) {
    if (runningEvents.has(event)) return true;
  }
  return false;
}

const debugColors = {
  bus: "#2563eb",
  clock: "#65a30d",
  cpu: "#dc2626",
  f10: "#65a30d",
  handshake: "#2563eb",
  keyboard: "#65a30d",
  leds: "#65a30d",
  memory: "#f59e0b",
  pic: "#2563eb",
  pio: "#2563eb",
  printer: "#65a30d",
  screen: "#65a30d",
  switches: "#65a30d",
  timer: "#2563eb",
};

function detailedLog(event: SimulatorEvent) {
  const [ns, name] = event.type.split(":", 2) as Split<EventType, ":">;

  console.group(
    `%c ${ns} %c ${name}`,
    `background: ${debugColors[ns]}; color: #fff; font-weight: bold;`,
    "background: unset; color: unset; font-weight: normal;",
  );
  for (const key in event) {
    if (key !== "type" && Object.prototype.hasOwnProperty.call(event, key)) {
      const element = event[key as keyof SimulatorEvent] as unknown;
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
        console.log(
          `${key}: %c${element.toString(16)}h %c(number)`,
          "color: #8b5cf6;",
          "color: #737373;",
        );
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
}
