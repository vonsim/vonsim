import { assemble } from "@vonsim/assembler";
import { Byte } from "@vonsim/common/byte";
import { ComputerState, EventGenerator, Simulator, SimulatorError } from "@vonsim/simulator";
import { atom } from "jotai";
import { toast } from "sonner";

import { highlightLine, setReadOnly } from "@/editor/methods";
import { translate } from "@/lib/i18n";
import { store } from "@/lib/jotai";
import { getSettings } from "@/lib/settings";

import { resetConsoleState } from "./console/state";
import { cycleAtom, resetCPUState } from "./cpu/state";
import { handleEvent } from "./handle-event";
import { resetMemoryState } from "./memory/state";
import { resetPICState } from "./pic/state";
import { resetPIOState } from "./pio/state";
import { anim, resumeAllAnimations, stopAllAnimations } from "./shared/animate";
import { resetTimerState } from "./timer/state";
import { DATAAtom, STATEAtom } from "./unfinished/handshake";
import { ledsAtom } from "./unfinished/leds";
import { bufferAtom, paperAtom } from "./unfinished/printer";
import { switchesAtom } from "./unfinished/switches";

export const simulator = new Simulator();

type SimulationStatus =
  | { type: "running"; until: "end-of-instruction" | "infinity"; waitingForInput?: boolean }
  | { type: "paused" }
  | { type: "stopped"; error?: SimulatorError<any> };

export const simulationAtom = atom<SimulationStatus>({ type: "stopped" });
const getState = () => store.get(simulationAtom);

function notifyError(error: SimulatorError<any>) {
  const message = error.translate(getSettings().language);
  toast.error(message);
}

export function finish(error?: SimulatorError<any>) {
  if (error) notifyError(error);

  highlightLine(null);
  setReadOnly(false);
  store.set(simulationAtom, { type: "stopped", error });
  store.set(cycleAtom, { phase: "stopped", error });
  stopAllAnimations();
}

export function startDebugger() {
  store.set(simulationAtom, { type: "paused" });
}

function assembleError() {
  toast.error(translate(getSettings().language, "messages.assemble-error"));
}

function invalidAction() {
  toast.error(translate(getSettings().language, "messages.invalid-action"));
}

function resetState(state: ComputerState) {
  resetCPUState(state);
  resetMemoryState(state);

  resetPICState(state);
  resetPIOState(state);
  resetTimerState(state);

  resetConsoleState(state);

  if ("handshake" in state.io) {
    store.set(DATAAtom, Byte.fromUnsigned(state.io.handshake.DATA, 8));
    store.set(STATEAtom, Byte.fromUnsigned(state.io.handshake.STATE, 8));
  }
  if ("leds" in state.io) {
    store.set(ledsAtom, Byte.fromUnsigned(state.io.leds, 8));
  }
  if ("printer" in state.io) {
    store.set(
      bufferAtom,
      state.io.printer.buffer.map(char => Byte.fromUnsigned(char, 8)),
    );
    store.set(paperAtom, state.io.printer.paper);
  }
  if ("switches" in state.io) {
    store.set(switchesAtom, Byte.fromUnsigned(state.io.switches, 8));
  }
}

type Action =
  | [action: "cpu.run"]
  | [action: "cpu.stop"]
  | [action: "f10.press"]
  | [action: "switch.toggle", index: number]
  | [action: "console.sendChar", char: string]
  | [action: "console.clean"]
  | [action: "printer.clean"];

export async function dispatch(...args: Action) {
  const action = args[0];
  const state = getState();

  switch (action) {
    case "cpu.run": {
      if (state.type === "running") return invalidAction();

      if (state.type === "stopped") {
        if (!window.codemirror) return;

        const code = window.codemirror.state.doc.toString();
        const result = assemble(code);

        if (!result.success) return assembleError();

        setReadOnly(true);

        // Reset the simulator
        simulator.loadProgram({
          program: result,
          data: getSettings().dataOnLoad,
          devices: getSettings().devices,
        });
        resetState(simulator.getComputerState());

        store.set(simulationAtom, { type: "running", until: "infinity" });

        startThread(simulator.startCPU());
        startClock();
      } else {
        store.set(simulationAtom, {
          type: "running",
          until: "infinity",
          waitingForInput: false,
        });

        resumeAllAnimations();
      }

      return;
    }

    // case "cpu.pause": {

    // }

    case "cpu.stop": {
      finish();
      return;
    }

    case "f10.press": {
      if (state.type !== "running") return invalidAction();

      startThread(simulator.devices.f10.press());
      return;
    }

    case "switch.toggle": {
      if (state.type !== "running" || !simulator.devices.switches.connected())
        return invalidAction();

      const index = args[1];
      startThread(simulator.devices.switches.toggle(index)!);
      return;
    }

    case "console.sendChar": {
      if (state.type !== "running" || !state.waitingForInput) return invalidAction();

      // Save read character
      simulator.devices.console.readChar(Byte.fromChar(args[1]));

      store.set(simulationAtom, { ...state, waitingForInput: false });
      return;
    }

    case "console.clean": {
      startThread(simulator.devices.console.clear());
      return;
    }

    case "printer.clean": {
      if (!simulator.devices.printer.connected()) return invalidAction();

      startThread(simulator.devices.printer.clear()!);
      return;
    }

    default: {
      const _exhaustiveCheck: never = action;
      return _exhaustiveCheck;
    }
  }
}

async function startThread(generator: EventGenerator): Promise<void> {
  try {
    while (getState().type === "running") {
      const event = generator.next();
      if (event.done) break;
      await handleEvent(event.value);
    }
    generator.return();
  } catch (error) {
    const err = SimulatorError.from(error);
    finish(err);
  }
}

async function startClock(): Promise<void> {
  try {
    while (getState().type === "running") {
      const duration = getSettings().clockSpeed;
      await anim({ key: "clock.angle", from: 0, to: 360 }, { duration, easing: "linear" });
      startThread(simulator.devices.clock.tick());
    }
  } catch (error) {
    const err = SimulatorError.from(error);
    finish(err);
  }
}
