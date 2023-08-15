/**
 * @fileoverview
 * This file exposes methods/state that the UI uses to interact with the simulator.
 */

import { assemble } from "@vonsim/assembler";
import { Byte } from "@vonsim/common/byte";
import { ComputerState, EventGenerator, Simulator, SimulatorError } from "@vonsim/simulator";
import { atom, useAtomValue } from "jotai";
import { useMemo } from "react";
import { toast } from "sonner";

import { highlightLine, setReadOnly } from "@/editor/methods";
import { useDevices } from "@/hooks/useSettings";
import { translate } from "@/lib/i18n";
import { store } from "@/lib/jotai";
import { getSettings } from "@/lib/settings";

import { cycleAtom, resetCPUState } from "./cpu/state";
import { eventIsRunning, handleEvent } from "./handle-event";
import { resetHandshakeState } from "./handshake/state";
import { resetLedsState } from "./leds/state";
import { resetMemoryState } from "./memory/state";
import { resetPICState } from "./pic/state";
import { resetPIOState } from "./pio/state";
import { resetPrinterState } from "./printer/state";
import { resetScreenState } from "./screen/state";
import { anim, resumeAllAnimations, stopAllAnimations } from "./shared/animate";
import { resetSwitchesState } from "./switches/state";
import { resetTimerState } from "./timer/state";

const simulator = new Simulator();

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

  resetHandshakeState(state);
  resetPICState(state);
  resetPIOState(state);
  resetTimerState(state);

  resetLedsState(state);
  resetPrinterState(state);
  resetScreenState(state);
  resetSwitchesState(state);
}

type Action =
  | [action: "cpu.run"]
  | [action: "cpu.stop"]
  | [action: "f10.press"]
  | [action: "switch.toggle", index: number]
  | [action: "keyboard.sendChar", char: string]
  | [action: "screen.clean"]
  | [action: "printer.clean"];

async function dispatch(...args: Action) {
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
        startPrinter();
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

    case "cpu.stop": {
      finish();
      return;
    }

    case "f10.press": {
      if (state.type !== "running") return invalidAction();

      // Prevent simultaneous presses
      if (eventIsRunning("f10:press")) return;

      startThread(simulator.devices.f10.press());
      return;
    }

    case "switch.toggle": {
      if (state.type !== "running" || !simulator.devices.switches.connected()) {
        return invalidAction();
      }

      // Prevent simultaneous presses
      if (eventIsRunning("switches:toggle")) return;

      const index = args[1];
      startThread(simulator.devices.switches.toggle(index)!);
      return;
    }

    case "keyboard.sendChar": {
      if (state.type !== "running" || !state.waitingForInput) return invalidAction();

      // Save read character
      simulator.devices.keyboard.readChar(Byte.fromChar(args[1]));

      store.set(simulationAtom, { ...state, waitingForInput: false });
      return;
    }

    case "screen.clean": {
      startThread(simulator.devices.screen.clear());
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

async function startPrinter(): Promise<void> {
  if (!simulator.devices.printer.connected()) return;

  try {
    while (getState().type === "running") {
      const duration = getSettings().printerSpeed;
      await anim(
        [
          { key: "printer.printing.opacity", from: 1 },
          { key: "printer.printing.progress", from: 0, to: 1 },
        ],
        { duration, easing: "easeInOutSine" },
      );
      await anim({ key: "printer.printing.opacity", to: 0 }, { duration: 1, easing: "easeInSine" });
      startThread(simulator.devices.printer.print()!);
    }
  } catch (error) {
    const err = SimulatorError.from(error);
    finish(err);
  }
}

export function useSimulation() {
  const status = useAtomValue(simulationAtom);

  const devicesPreset = useDevices();
  const devices = useMemo(
    () => ({
      preset: devicesPreset,

      clock: true,
      f10: true,
      keyboard: true,
      handshake: devicesPreset === "handshake",
      leds: devicesPreset === "pio-switches-and-leds",
      pic: true,
      pio: devicesPreset === "pio-switches-and-leds" || devicesPreset === "pio-printer",
      printer: devicesPreset === "pio-printer" || devicesPreset === "handshake",
      screen: true,
      switches: devicesPreset === "pio-switches-and-leds",
      timer: true,
    }),
    [devicesPreset],
  );

  return { status, dispatch, devices };
}
