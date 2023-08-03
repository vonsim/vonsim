import { assemble } from "@vonsim/assembler";
import { Byte } from "@vonsim/common/byte";
import { ComputerState, Simulator, type SimulatorError } from "@vonsim/simulator";
import { atom } from "jotai";
import { toast } from "sonner";

import { highlightLine, setReadOnly } from "@/editor/methods";
import { translate } from "@/lib/i18n";
import { store } from "@/lib/jotai";
import { getDataOnLoad, getDevices, getLanguage, getSpeeds } from "@/lib/settings";
import { resetCPUState } from "@/simulator/computer/cpu/state";
import { memoryAtom } from "@/simulator/computer/memory/state";
import { DATAAtom, STATEAtom } from "@/simulator/computer/unfinished/handshake";
import { ledsAtom } from "@/simulator/computer/unfinished/leds";
import { IMRAtom, IRRAtom, ISRAtom, linesAtom } from "@/simulator/computer/unfinished/pic";
import { CAAtom, CBAtom, PAAtom, PBAtom } from "@/simulator/computer/unfinished/pio";
import { bufferAtom, paperAtom } from "@/simulator/computer/unfinished/printer";
import { switchesAtom } from "@/simulator/computer/unfinished/switches";
import { COMPAtom, CONTAtom } from "@/simulator/computer/unfinished/timer";
import { handleEvent } from "@/simulator/handle-event";
import { notifyError } from "@/simulator/helpers";

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

function resetState(state: ComputerState) {
  resetCPUState(state);
  store.set(
    memoryAtom,
    state.memory.map(byte => Byte.fromUnsigned(byte, 8)),
  );
  store.set(IMRAtom, Byte.fromUnsigned(state.io.pic.IMR, 8));
  store.set(IRRAtom, Byte.fromUnsigned(state.io.pic.IRR, 8));
  store.set(ISRAtom, Byte.fromUnsigned(state.io.pic.ISR, 8));
  store.set(
    linesAtom,
    state.io.pic.lines.map(line => Byte.fromUnsigned(line, 8)),
  );
  store.set(CONTAtom, Byte.fromUnsigned(state.io.timer.CONT, 8));
  store.set(COMPAtom, Byte.fromUnsigned(state.io.timer.COMP, 8));

  if ("handshake" in state.io) {
    store.set(DATAAtom, Byte.fromUnsigned(state.io.handshake.DATA, 8));
    store.set(STATEAtom, Byte.fromUnsigned(state.io.handshake.STATE, 8));
  }
  if ("leds" in state.io) {
    store.set(ledsAtom, Byte.fromUnsigned(state.io.leds, 8));
  }
  if ("pio" in state.io) {
    store.set(PAAtom, Byte.fromUnsigned(state.io.pio.PA, 8));
    store.set(PBAtom, Byte.fromUnsigned(state.io.pio.PB, 8));
    store.set(CAAtom, Byte.fromUnsigned(state.io.pio.CA, 8));
    store.set(CBAtom, Byte.fromUnsigned(state.io.pio.CB, 8));
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
  | [action: "run"]
  | [action: "step"]
  | [action: "stop"]
  | [action: "f10.press"]
  | [action: "switch.toggle", index: number]
  | [action: "console.handleKey", event: InputEvent]
  | [action: "console.clean"]
  | [action: "printer.clean"];

export async function dispatch(...args: Action) {
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
        resetState(simulator.getComputerState());

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

// DEBUG: Legacy runner, will be removed in the future

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

// DEBUG: Remove later
export async function newStart() {
  const state = getState();
  if (state.type !== "stopped" && state.type !== "paused") {
    assembleError();
    return;
  }

  if (state.type === "stopped") {
    if (!window.codemirror) return;

    const code = window.codemirror.state.doc.toString();
    const result = assemble(code);

    if (!result.success) {
      assembleError();
      return;
    }

    setReadOnly(true);

    // Reset the simulator
    simulator.loadProgram({
      program: result,
      data: getDataOnLoad(),
      devices: getDevices(),
    });
    resetSimulatorTimers();
    resetState(simulator.getComputerState());

    // Highlight the ORG 2000h line
    const initial = result.instructions.find(i => i.start.value === 0x2000);
    if (initial) highlightLine(initial.position.start);
  }

  store.set(simulatorStateAtom, { type: "running" });

  let event = simulator.advanceCPU();
  while (true) {
    await handleEvent(event);
    if (getState().type !== "running" && getState().type !== "paused") return;
    event = simulator.advanceCPU();
  }
}
