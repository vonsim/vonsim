/**
 * @fileoverview
 * This file exposes methods/state that the UI uses to interact with the simulator.
 */

import { assemble } from "@vonsim/assembler";
import { Byte } from "@vonsim/common/byte";
import { ComputerState, EventGenerator, Simulator, SimulatorError } from "@vonsim/simulator";
import { atom, useAtomValue } from "jotai";
import { useMemo } from "react";

import { highlightLine, setReadOnly } from "@/editor/methods";
import { translate } from "@/lib/i18n";
import { store } from "@/lib/jotai";
import { posthog } from "@/lib/posthog";
import { getSettings, useDevices } from "@/lib/settings";
import { toast } from "@/lib/toast";

import { cycleAtom, resetCPUState } from "./cpu/state";
import { eventIsRunning, handleEvent } from "./handle-event";
import { resetHandshakeState } from "./handshake/state";
import { resetLedsState } from "./leds/state";
import { resetMemoryState } from "./memory/state";
import { resetPICState } from "./pic/state";
import { resetPIOState } from "./pio/state";
import { resetPrinterState } from "./printer/state";
import { resetScreenState } from "./screen/state";
import { anim, pauseAllAnimations, resumeAllAnimations, stopAllAnimations } from "./shared/animate";
import { resetSwitchesState } from "./switches/state";
import { resetTimerState } from "./timer/state";

const simulator = new Simulator();

type RunUntil = "cycle-change" | "end-of-instruction" | "infinity";
type SimulationStatus =
  | { type: "running"; until: RunUntil; waitingForInput: boolean }
  | { type: "paused" }
  | { type: "stopped"; error?: SimulatorError<any> };

export const simulationAtom = atom<SimulationStatus>({ type: "stopped" });

function notifyError(error: SimulatorError<any>) {
  const message = error.translate(getSettings().language);
  toast({ title: message, variant: "error" });
}

export function finishSimulation(error?: SimulatorError<any>) {
  if (error) notifyError(error);

  highlightLine(null);
  setReadOnly(false);
  store.set(simulationAtom, { type: "stopped", error });
  store.set(cycleAtom, { phase: "stopped", error });
  stopAllAnimations();
}

export function pauseSimulation() {
  store.set(simulationAtom, { type: "paused" });
  pauseAllAnimations();
}

function assembleError() {
  toast({ title: translate(getSettings().language, "messages.assemble-error"), variant: "error" });
}

function invalidAction() {
  toast({ title: translate(getSettings().language, "messages.invalid-action"), variant: "error" });
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

/**
 * Starts an execution thread for the given generator. This is, run all the
 * events until the generator is done or the simulation is stopped.
 */
async function startThread(generator: EventGenerator): Promise<void> {
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const status = store.get(simulationAtom);
      const settings = getSettings();
      if (status.type === "stopped") break; // stop the thread
      if (status.type === "paused") {
        // Wait until the simulation is resumed
        await new Promise<void>(resolve => {
          const unsubscribe = store.sub(simulationAtom, () => {
            unsubscribe();
            resolve();
          });
        });
        continue; // restart loop
      }

      // Handle event
      const event = generator.next();
      if (event.done) break;
      await handleEvent(event.value);

      if (event.value.type === "cpu:cycle.update" || event.value.type === "cpu:cycle.interrupt") {
        if (status.until === "cycle-change") {
          pauseSimulation();
        } else if (!settings.animations) {
          // If animations are disabled, wait for some time to not overwhelm the CPU
          await new Promise(resolve => setTimeout(resolve, settings.executionUnit));
        }
      } else if (event.value.type === "cpu:cycle.end") {
        if (status.until === "cycle-change" || status.until === "end-of-instruction") {
          pauseSimulation();
        } else if (!settings.animations) {
          // If animations are disabled, wait for some time to not overwhelm the CPU
          await new Promise(resolve => setTimeout(resolve, settings.executionUnit));
        }
      }
    }

    generator.return();
  } catch (error) {
    const err = SimulatorError.from(error);
    finishSimulation(err);
  }
}

type Action =
  | [action: "cpu.run", until: RunUntil]
  | [action: "cpu.stop"]
  | [action: "f10.press"]
  | [action: "switch.toggle", index: number]
  | [action: "keyboard.sendChar", char: string]
  | [action: "screen.clean"]
  | [action: "printer.clean"];

async function dispatch(...args: Action) {
  const action = args[0];
  const status = store.get(simulationAtom);

  switch (action) {
    case "cpu.run": {
      if (status.type === "running") return invalidAction();

      const until = args[1];

      if (status.type === "stopped") {
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

        // Track event
        const event = [
          "Start CPU",
          {
            until,
            devices: getSettings().devices,
            language: getSettings().language,
            animations: getSettings().animations ? "yes" : "no",
          },
        ] as const;
        umami.track(...event);
        posthog.capture(...event);

        store.set(simulationAtom, { type: "running", until, waitingForInput: false });

        startThread(simulator.startCPU());
        startClock();
        startPrinter();
      } else {
        store.set(simulationAtom, { type: "running", until, waitingForInput: false });

        resumeAllAnimations();
      }

      return;
    }

    case "cpu.stop": {
      finishSimulation();
      return;
    }

    case "f10.press": {
      if (!simulator.devices.f10.connected() || status.type !== "running") return invalidAction();

      // Prevent simultaneous presses
      if (eventIsRunning("f10:press")) return;

      startThread(simulator.devices.f10.press()!);
      return;
    }

    case "switch.toggle": {
      if (status.type !== "running" || !simulator.devices.switches.connected()) {
        return invalidAction();
      }

      // Prevent simultaneous presses
      if (eventIsRunning("switches:toggle")) return;

      const index = args[1];
      startThread(simulator.devices.switches.toggle(index)!);
      return;
    }

    case "keyboard.sendChar": {
      if (status.type !== "running" || !status.waitingForInput) return invalidAction();

      // Save read character
      simulator.devices.keyboard.readChar(Byte.fromChar(args[1]));

      store.set(simulationAtom, { ...status, waitingForInput: false });
      return;
    }

    case "screen.clean": {
      if (!simulator.devices.screen.connected()) return invalidAction();

      startThread(simulator.devices.screen.clear()!);
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

async function startClock(): Promise<void> {
  if (!simulator.devices.clock.connected()) return;

  while (store.get(simulationAtom).type !== "stopped") {
    const duration = getSettings().clockSpeed;
    await anim(
      { key: "clock.angle", from: 0, to: 360 },
      { duration, forceMs: true, easing: "linear" },
    );
    startThread(simulator.devices.clock.tick()!);
  }
}

async function startPrinter(): Promise<void> {
  if (!simulator.devices.printer.connected()) return;

  while (store.get(simulationAtom).type !== "stopped") {
    const duration = getSettings().printerSpeed;
    await anim(
      [
        { key: "printer.printing.opacity", from: 1 },
        { key: "printer.printing.progress", from: 0, to: 1 },
      ],
      { duration, forceMs: true, easing: "easeInOutSine" },
    );
    await anim({ key: "printer.printing.opacity", to: 0 }, { duration: 1, easing: "easeInSine" });
    startThread(simulator.devices.printer.print()!);
  }
}

export function useSimulation() {
  const status = useAtomValue(simulationAtom);

  const devicesPreset = useDevices();
  const devices = useMemo(
    () => ({
      preset: devicesPreset,
      hasIOBus:
        devicesPreset === "pio-switches-and-leds" ||
        devicesPreset === "pio-printer" ||
        devicesPreset === "handshake",

      clock:
        devicesPreset === "pio-switches-and-leds" ||
        devicesPreset === "pio-printer" ||
        devicesPreset === "handshake",
      f10:
        devicesPreset === "pio-switches-and-leds" ||
        devicesPreset === "pio-printer" ||
        devicesPreset === "handshake",
      keyboard:
        devicesPreset === "keyboard-and-screen" ||
        devicesPreset === "pio-switches-and-leds" ||
        devicesPreset === "pio-printer" ||
        devicesPreset === "handshake",
      handshake: devicesPreset === "handshake",
      leds: devicesPreset === "pio-switches-and-leds",
      pic:
        devicesPreset === "pio-switches-and-leds" ||
        devicesPreset === "pio-printer" ||
        devicesPreset === "handshake",
      pio: devicesPreset === "pio-switches-and-leds" || devicesPreset === "pio-printer",
      printer: devicesPreset === "pio-printer" || devicesPreset === "handshake",
      screen:
        devicesPreset === "keyboard-and-screen" ||
        devicesPreset === "pio-switches-and-leds" ||
        devicesPreset === "pio-printer" ||
        devicesPreset === "handshake",
      switches: devicesPreset === "pio-switches-and-leds",
      timer:
        devicesPreset === "pio-switches-and-leds" ||
        devicesPreset === "pio-printer" ||
        devicesPreset === "handshake",
    }),
    [devicesPreset],
  );

  return { status, dispatch, devices };
}
