import { toast } from "react-hot-toast";
import { match, P } from "ts-pattern";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { compile } from "@/compiler";
import { sleep } from "@/helpers";
import { useSimulator } from "@/simulator";
import { SimulatorError } from "@/simulator/error";

import { CONSOLE_ID } from "./components/Console";
import { highlightLine, setReadOnly } from "./components/editor/methods";
import { useSettings } from "./settings";

type Ticker = "cpu" | "printer" | "timer";
type Timer = { lastTick: number; interval: number };
type InputListener = (ev: KeyboardEvent) => void;

type RunnerStore = {
  state:
    | { type: "running" }
    | { type: "paused" }
    | { type: "waiting-for-input"; inputListener: InputListener }
    | { type: "stopped"; reason: "halt" | "error" };
  dispatch: (action: "run" | "step" | "stop") => void;
  currentTime: number;
  clocks: Record<Ticker, Timer>;
  updateSimulator: () => void;
  finish: (err?: SimulatorError<any>) => void;
};

const simulator = () => useSimulator.getState();
const INPUT_LISTENER_EVENT = "keydown" as const;

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
          async ([state, action]) => {
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
                state: { type: action === "run" ? "running" : "paused" },
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

            const resolution = 15; // ms
            while (get().state.type === "running") {
              const start = performance.now();

              get().updateSimulator();

              // Increment the current time by the event loop resolution
              set(runner => ({ currentTime: runner.currentTime + resolution }));

              const end = performance.now();
              await sleep(resolution - (end - start));
            }
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
          const previousState = get().state;

          const inputListener: InputListener = ev => {
            let char: string;
            if (/^[\x20-\xFF]$/.test(ev.key)) char = ev.key;
            else if (ev.key === "Enter") char = "\n";
            else return;

            ev.preventDefault();
            document.removeEventListener(INPUT_LISTENER_EVENT, inputListener);

            const address = simulator().getRegister("BX");

            const saved = simulator().setMemory(address, "byte", char.charCodeAt(0));
            if (saved.isErr()) return get().finish(saved.unwrapErr());

            simulator().devices.console.write(char);

            set({ state: previousState });
          };

          document.addEventListener(INPUT_LISTENER_EVENT, inputListener);
          document.getElementById(CONSOLE_ID)?.scrollIntoView({ behavior: "smooth" });
          set({ state: { type: "waiting-for-input", inputListener } });
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
     * Exit the program and notify the user if an error occurred.
     */
    finish: err => {
      if (err) notify(err);

      highlightLine(null);
      setReadOnly(false);
      set(runner => {
        if (runner.state.type === "waiting-for-input") {
          document.removeEventListener(INPUT_LISTENER_EVENT, runner.state.inputListener);
        }
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
