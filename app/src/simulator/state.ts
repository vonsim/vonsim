import { assemble } from "@vonsim/assembler";
import { Byte } from "@vonsim/common/byte";
import { ComputerState, EventGenerator, Simulator, SimulatorError } from "@vonsim/simulator";
import { atom } from "jotai";
import { toast } from "sonner";

import { highlightLine, setReadOnly } from "@/editor/methods";
import { translate } from "@/lib/i18n";
import { store } from "@/lib/jotai";
import { getSettings } from "@/lib/settings";
import { cycleAtom, resetCPUState } from "@/simulator/computer/cpu/state";
import { resetMemoryState } from "@/simulator/computer/memory/state";
import { resetPICState } from "@/simulator/computer/pic/state";
import { anim, resumeAllAnimations, stopAllAnimations } from "@/simulator/computer/shared/animate";
import { resetTimerState } from "@/simulator/computer/timer/state";
import { DATAAtom, STATEAtom } from "@/simulator/computer/unfinished/handshake";
import { ledsAtom } from "@/simulator/computer/unfinished/leds";
import { CAAtom, CBAtom, PAAtom, PBAtom } from "@/simulator/computer/unfinished/pio";
import { bufferAtom, paperAtom } from "@/simulator/computer/unfinished/printer";
import { switchesAtom } from "@/simulator/computer/unfinished/switches";
import { handleEvent } from "@/simulator/handle-event";
import { notifyError } from "@/simulator/helpers";

export const simulator = new Simulator();

type SimulatorState =
  | { type: "running"; until: "end-of-instruction" | "infinity"; waitingForInput?: boolean }
  | { type: "paused" }
  | { type: "stopped"; error?: SimulatorError<any> };

export const simulatorStateAtom = atom<SimulatorState>({ type: "stopped" });
const getState = () => store.get(simulatorStateAtom);

export function finish(error?: SimulatorError<any>) {
  if (error) notifyError(error);

  highlightLine(null);
  setReadOnly(false);
  store.set(simulatorStateAtom, { type: "stopped", error });
  store.set(cycleAtom, { phase: "stopped", error });
  stopAllAnimations();
}

export function startDebugger() {
  store.set(simulatorStateAtom, { type: "paused" });
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
  resetTimerState(state);

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
  | [action: "cpu.run"]
  | [action: "cpu.stop"]
  | [action: "f10.press"]
  | [action: "switch.toggle", index: number]
  | [action: "console.handleKey", event: InputEvent]
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

        store.set(simulatorStateAtom, { type: "running", until: "infinity" });

        startThread(simulator.startCPU());
        startClock();
      } else {
        store.set(simulatorStateAtom, {
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

    /**
     * Handle a key input from the user after a `INT 6`. Will be emited by the Console.
     *
     * It's a InputEvent and not a KeyboardEvent because the latter
     * works awfully on mobile devices.
     * https://clark.engineering/input-on-android-229-unidentified-1d92105b9a04
     */
    case "console.handleKey": {
      if (state.type !== "running" || !state.waitingForInput) return invalidAction();

      const ev = args[1];
      let char: string;

      if (ev.inputType === "insertLineBreak") {
        char = "\n";
      } else if (ev.inputType === "insertText" || ev.inputType === "insertCompositionText") {
        if (!ev.data) return;
        char = ev.data;
      } else {
        return;
      }

      // Save read character
      simulator.devices.console.readChar(Byte.fromChar(char));

      store.set(simulatorStateAtom, { ...state, waitingForInput: false });
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
