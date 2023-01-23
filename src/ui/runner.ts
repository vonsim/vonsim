import { toast } from "react-hot-toast";
import { match, P } from "ts-pattern";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { compile } from "@/compiler";
import { useSimulator } from "@/simulator";
import { SimulatorError } from "@/simulator/error";

import { CONSOLE_ID } from "./components/Console";
import { highlightLine, setReadOnly } from "./components/editor/methods";
import { useSettings } from "./settings";

type Ticker = "cpu" | "printer" | "timer";
type Timer = { lastTick: number; interval: number };

type RunnerStore = {
  state:
    | { type: "running" }
    | { type: "paused" }
    | { type: "waiting-for-input"; previousState: "running" | "paused" }
    | { type: "stopped"; reason: "halt" | "error" };
  dispatch: (action: "run" | "step" | "stop") => void;
  currentTime: number;
  clocks: Record<Ticker, Timer>;
  updateSimulator: () => void;
  handleKeyInput: (ev: InputEvent) => void;
  finish: (err?: SimulatorError<any>) => void;
};

const simulator = () => useSimulator.getState();

export const useRunner = create<RunnerStore>()(
  immer((set, get) => ({
    /**
     * The current state of the runner
     * - "running": The program is running continuously
     * - "paused": The program is paused, waiting for the user to press "step"
     * - "waiting-for-input": The program is paused, waiting for the user to press a key
     * - "stopped": The program not running
     */
    state: { type: "stopped", reason: "halt" },

    /**
     * Intent to change the state of the runner by the user
     */
    dispatch: action => {
      const { state } = get();

      match([state, action] as const)
        .with(
          [{ type: P.union("paused", "stopped") }, P.union("run", "step")],
          ([state, action]) => {
            if (state.type === "stopped") {
              if (!window.codemirror) return;

              const code = window.codemirror.state.doc.toString();
              const result = compile(code);

              if (!result.success) {
                notify(new SimulatorError("compile-error"));
                return;
              }

              setReadOnly(true);

              // Get user settings
              const { memoryOnReset, devicesConfiguration, cpuSpeed, printerSpeed } =
                useSettings.getState();

              // Reset the simulator
              simulator().loadProgram(result, {
                memoryConfig: memoryOnReset,
                devicesConfiguration,
              });

              set({
                currentTime: 0,
                clocks: {
                  cpu: initTimer(Math.round(1000 / cpuSpeed)),
                  printer: initTimer(Math.round(1000 / printerSpeed)),
                  timer: initTimer(1000),
                },
              });
            }

            // else, state.type === "paused"
            // which means that the program is already loaded and
            // the user wants to run it or step through it

            if (action === "step") {
              if (state.type !== "paused") set({ state: { type: "paused" } });
              get().updateSimulator();

              // Increment the current time by the CPU interval, since
              // we ran exactly one instruction
              set(runner => ({ currentTime: runner.currentTime + runner.clocks.cpu.interval }));
              return;
            }

            // action === "run"
            // Start the continuous loop
            set({ state: { type: "running" } });

            const resolution = 8; // ms
            const interval = setInterval(() => {
              if (get().state.type !== "running") {
                clearInterval(interval);
                return;
              }

              get().updateSimulator();

              // Increment the current time by the event loop resolution
              set(runner => ({ currentTime: runner.currentTime + resolution }));
            }, resolution);
          },
        )
        .with([{ type: P.not("stopped") }, "stop"], () => get().finish())
        .otherwise(() => notify(new SimulatorError("invalid-action")));
    },

    /**
     * The current internal time in milliseconds
     * We don't use Date.now() because the execution of the program
     * can be paused, and nothing should happen in the meantime.
     */
    currentTime: 0,

    /**
     * Since we have multiple devices with different clocks, we need
     * to keep track of the last time each one was updated.
     */
    clocks: {
      cpu: { lastTick: 0, interval: 0 },
      printer: { lastTick: 0, interval: 0 },
      timer: { lastTick: 0, interval: 0 },
    },

    /**
     * Update the state of all the devices. Since each device has its own
     * clock, every individual device can be updated one or more times, or
     * not at all.
     */
    updateSimulator: () => {
      const { clocks, currentTime, finish } = get();

      // Update CPU
      const cpu = getTicks(currentTime, clocks.cpu);
      for (let i = 0; i < cpu.ticks; i++) {
        const result = simulator().executeInstruction({
          beforeExecution: instruction => {
            highlightLine(instruction.meta.position[0]);
          },
        });

        if (result.isErr()) return finish(result.unwrapErr());

        const ret = result.unwrap();
        if (ret === "halt") {
          return finish();
        } else if (ret === "start-debugger") {
          set({ state: { type: "paused" } });
          break;
        } else if (ret === "wait-for-input") {
          set(runner => ({
            state: { type: "waiting-for-input", previousState: runner.state.type },
          }));

          const console = document.getElementById(CONSOLE_ID)!;
          console.scrollIntoView({ behavior: "smooth" });
          console.focus({ preventScroll: true });
          break;
        }
        // ret = 'continue'
        // Do nothing
      }

      // Update Handshake
      // Should be updated before the printer to save some cycles.
      simulator().devices.handshake.update();

      // Update printer
      const printer = getTicks(currentTime, clocks.printer);
      for (let i = 0; i < printer.ticks; i++) {
        simulator().devices.printer.consumeBuffer();
      }

      // Update timer
      const timer = getTicks(currentTime, clocks.timer);
      for (let i = 0; i < timer.ticks; i++) {
        simulator().devices.timer.tick();
      }

      // Update PIC
      // Should be updated last because it may trigger
      // an interrupt from one of the other devices.
      const picResult = simulator().devices.pic.update();
      if (picResult.isErr()) return finish(picResult.unwrapErr());

      set(runner => {
        runner.clocks.cpu.lastTick = cpu.lastTick;
        runner.clocks.printer.lastTick = printer.lastTick;
        runner.clocks.timer.lastTick = timer.lastTick;
      });
    },

    /**
     * Handle a key input from the user. Will be emited by the Console.
     *
     * It's a InputEvent and not a KeyboardEvent because the latter
     * works awfully on mobile devices.
     * https://clark.engineering/input-on-android-229-unidentified-1d92105b9a04
     */
    handleKeyInput: ev => {
      ev.preventDefault();

      const state = get().state;
      if (state.type !== "waiting-for-input") return;

      let char: string;

      if (ev.inputType === "insertLineBreak") {
        char = "\n";
      } else if (ev.inputType === "insertText" || ev.inputType === "insertCompositionText") {
        if (!ev.data) return;
        char = ev.data;
      } else {
        return;
      }

      const result = simulator().handleInt6(char);
      if (result.isErr()) return get().finish(result.unwrapErr());

      set({ state: { type: "paused" } });
      get().dispatch(state.previousState === "running" ? "run" : "step");
    },

    /**
     * Exit the program and notify the user if an error occurred.
     */
    finish: err => {
      if (err) notify(err);

      highlightLine(null);
      setReadOnly(false);
      set(runner => {
        runner.state = { type: "stopped", reason: err ? "error" : "halt" };
      });
    },
  })),
);

function notify(error: SimulatorError<any>) {
  const lang = useSettings.getState().language;
  const message = error.translate(lang);
  toast.error(message);
}

function initTimer(interval: number): Timer {
  // Timer starts at -interval so that the first tick happens immediately
  // after the timer is started.
  return { lastTick: -interval, interval };
}

function getTicks(currentTime: number, timer: Timer) {
  const diff = currentTime - timer.lastTick;
  const ticks = Math.floor(diff / timer.interval);
  const lastTick = timer.lastTick + ticks * timer.interval;

  return { ticks, lastTick };
}
