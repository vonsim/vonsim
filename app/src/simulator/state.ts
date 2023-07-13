import { assemble } from "@vonsim/assembler";
import { Byte } from "@vonsim/common/byte";
import { Simulator, type SimulatorError } from "@vonsim/simulator";
import { toast } from "sonner";

import { highlightLine, setReadOnly } from "@/editor/methods";
import { translate } from "@/lib/i18n";
import { atom, store } from "@/lib/jotai";
import { getDataOnLoad, getDevices, getLanguage, getSpeeds } from "@/lib/settings";
import { handleEvent } from "@/simulator/components";
import { notifyError } from "@/simulator/helpers";
import { resetState } from "@/simulator/reset";

export const simulator = new Simulator();

type SimulatorState =
  | { type: "running" }
  | { type: "paused" }
  | { type: "waiting-for-input"; previousState: "running" | "paused" }
  | { type: "stopped"; reason: "halt" | "error" };

export const simulatorStateAtom = atom<SimulatorState>({ type: "stopped", reason: "halt" });
const getState = () => store.get(simulatorStateAtom);

export function finish(err?: SimulatorError<any>) {
  if (err) notifyError(err);

  highlightLine(null);
  setReadOnly(false);
  store.set(simulatorStateAtom, { type: "stopped", reason: err ? "error" : "halt" });
}

export function startDebugger() {
  store.set(simulatorStateAtom, { type: "paused" });
}

function assembleError() {
  toast.error(translate(getLanguage(), "messages.assemble-error"));
}

type Action =
  | [action: "run"]
  | [action: "step"]
  | [action: "stop"]
  | [action: "f10.press"]
  | [action: "switch.toggle", index: number]
  | [action: "console.handleKey", event: InputEvent]
  | [action: "console.clean"]
  | [action: "printer.clean"];

export function dispatch(...args: Action) {
  const action = args[0];
  const state = getState();

  switch (action) {
    // #=========================================================================#
    // # Run/Step/Stop                                                           #
    // #=========================================================================#

    case "run":
    case "step": {
      if (state.type !== "stopped" && state.type !== "paused") {
        assembleError();
        break;
      }

      if (state.type === "stopped") {
        if (!window.codemirror) break;

        const code = window.codemirror.state.doc.toString();
        const result = assemble(code);

        if (!result.success) {
          assembleError();
          break;
        }

        setReadOnly(true);

        // Reset the simulator
        simulator.loadProgram({
          program: result,
          data: getDataOnLoad(),
          devices: getDevices(),
        });
        resetSimulatorTimers();
        resetState(simulator);

        // Highlight the ORG 2000h line
        const initial = result.instructions.find(i => i.start.value === 0x2000);
        if (initial) highlightLine(initial.position.start);

        if (action === "step") startDebugger();
      }

      // By this point, the program is already loaded and
      // the user either wants to run it or step through it
      //
      // action === 'run' && state.type === ('paused' || 'stopped')
      // action === 'step' && state.type === 'paused'

      if (action === "step") {
        // Increment the current time by the CPU interval, since
        // we ran exactly one instruction
        const cpuCycleTime = Math.round(1000 / getSpeeds().cpu);
        runSimulator(cpuCycleTime);
      } else {
        store.set(simulatorStateAtom, { type: "running" });

        const resolution = 8; // ms

        // Run the first instruction immediately (better UX)
        runSimulator(resolution);

        // Start the continuous loop
        const interval = setInterval(() => {
          if (getState().type !== "running") {
            clearInterval(interval);
            return;
          }

          // Increment the current time by the event loop resolution
          runSimulator(resolution);
        }, resolution);
      }

      break;
    }

    case "stop": {
      if (state.type !== "stopped") finish();
      else assembleError();
      break;
    }

    // #=========================================================================#
    // # Devices actions                                                         #
    // #=========================================================================#

    case "f10.press": {
      const generator = simulator.devices.f10.press();
      let event = generator.next();
      while (!event.done) {
        handleEvent(event.value);
        event = generator.next();
      }
      break;
    }

    case "switch.toggle": {
      if (simulator.devices.switches.connected()) throw new Error("Invalid device call");

      const generator = simulator.devices.switches.toggle(args[1])!;
      let event = generator.next();
      while (!event.done) {
        handleEvent(event.value);
        event = generator.next();
      }
      break;
    }

    /**
     * Handle a key input from the user after a `INT 6`. Will be emited by the Console.
     *
     * It's a InputEvent and not a KeyboardEvent because the latter
     * works awfully on mobile devices.
     * https://clark.engineering/input-on-android-229-unidentified-1d92105b9a04
     */
    case "console.handleKey": {
      const ev = args[1];

      if (state.type !== "waiting-for-input") break;

      let char: string;

      if (ev.inputType === "insertLineBreak") {
        char = "\n";
      } else if (ev.inputType === "insertText" || ev.inputType === "insertCompositionText") {
        if (!ev.data) break;
        char = ev.data;
      } else {
        break;
      }

      // Resume execution
      const previous = state.previousState;
      store.set(simulatorStateAtom, { type: "paused" });

      // Send the character to the CPU
      handleEvent(simulator.advanceCPU(Byte.fromChar(char)));

      dispatch(previous === "running" ? "run" : "step");
      break;
    }

    case "console.clean": {
      const generator = simulator.devices.console.clear();
      let event = generator.next();
      while (!event.done) {
        handleEvent(event.value);
        event = generator.next();
      }
      break;
    }

    case "printer.clean": {
      if (simulator.devices.printer.connected()) {
        const generator = simulator.devices.printer.clear()!;
        let event = generator.next();
        while (!event.done) {
          handleEvent(event.value);
          event = generator.next();
        }
      }
      break;
    }

    default:
      break;
  }
}

// Legacy runner, will be removed in the future

let currentTime = 0;
let cpuNextTick = 0;
let clockNextTick = 0;
let printerNextTick = 0;

function resetSimulatorTimers() {
  currentTime = 0;
  cpuNextTick = 1000 / getSpeeds().cpu;
  clockNextTick = 1000;
  printerNextTick = 1000 / getSpeeds().printer;
}

function nextTicks(): [device: "cpu" | "clock" | "printer", nextTick: number][] {
  if (simulator.devices.printer.connected()) {
    return [
      ["cpu", cpuNextTick],
      ["clock", clockNextTick],
      ["printer", printerNextTick],
    ];
  } else {
    return [
      ["cpu", cpuNextTick],
      ["clock", clockNextTick],
    ];
  }
}

function runSimulator(ms: number) {
  let nextTick = nextTicks().sort((a, b) => a[1] - b[1])[0];

  while (nextTick[1] <= currentTime + ms) {
    if (nextTick[0] === "cpu") {
      let event = simulator.advanceCPU();
      while (event.type !== "cpu:cycle.end") {
        handleEvent(event);
        if (getState().type !== "running" && getState().type !== "paused") return;
        event = simulator.advanceCPU();
      }
      cpuNextTick += 1000 / getSpeeds().cpu;
    } else if (nextTick[0] === "clock") {
      const generator = simulator.devices.clock.tick();
      let event = generator.next();
      while (!event.done) {
        handleEvent(event.value);
        event = generator.next();
      }
      clockNextTick += 1000;
    } else if (nextTick[0] === "printer") {
      const generator = simulator.devices.printer.print()!;
      let event = generator.next();
      while (!event.done) {
        handleEvent(event.value);
        event = generator.next();
      }
      printerNextTick += 1000 / getSpeeds().printer;
    } else {
      const _exhaustiveCheck: never = nextTick[0];
      return _exhaustiveCheck;
    }

    ms -= nextTick[1] - currentTime;
    currentTime = nextTick[1];
    nextTick = nextTicks().sort((a, b) => a[1] - b[1])[0];
  }

  currentTime += ms;
}
