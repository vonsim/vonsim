/**
 * Simulator 🤝 React
 *
 * This file contains the simulator store, which is used to communicate between
 * the simulator and the React components.
 *
 * The simulator is a stateful object, which means that it has a state and
 * methods to change that state. React needs some way to access the state of
 * the simulator, mutate it, and listen for changes.
 *
 * The simulator has the following characteristics:
 * - It behaves like a state machine, with a finite number of states.
 * - It will only change state when a method is called. Thanks to this,
 *   we know exactly when the state changes.
 * - There is only one instance of the simulator, which is shared between
 *   all the components.
 * - All the state that the UI needs can be get through Simulator.toJSON()
 *
 * So, the approach is the following:
 * We have a Zustand store which stores the simulator state (and other things,
 * like the wheather the program is running or paused). Alongside the state,
 * we have a `dispatch` method which the UI can use to change the state. Inside
 * the `dispatch` method, we call the simulator methods, and then we manually
 * update the state of the store.
 *
 * Notes: I've tried to use proxies to automatically update the state of the
 * store when the simulator state changes, but it didn't work. Mainly because
 * the simulator state is a complex object with lots of deeply nested objects.
 * Using a proxy would simplify the code, but it better be a very good proxy
 * otherwise it would be painful to debug.
 */

import { toast } from "sonner";
import { createStore } from "zustand/vanilla";

import { compile } from "@/compiler";
import { Simulator, SimulatorState } from "@/simulator";
import { SimulatorError } from "@/simulator/common/error";
import { CONSOLE_ID } from "@/ui/components/Console";
import { highlightLine, setReadOnly } from "@/ui/editor/methods";
import { useSettings } from "@/ui/lib/settings";

const simulator = new Simulator();

type Action =
  | [action: "run"]
  | [action: "step"]
  | [action: "stop"]
  | [action: "f10.press"]
  | [action: "switch.toggle", index: number]
  | [action: "console.handleKey", event: InputEvent]
  | [action: "console.clean"]
  | [action: "printer.clean"];

export type SimulatorStore = {
  simulator: SimulatorState;
  state:
    | { type: "running" }
    | { type: "paused" }
    | { type: "waiting-for-input"; previousState: "running" | "paused" }
    | { type: "stopped"; reason: "halt" | "error" };
  dispatch: (...args: Action) => void;
};

export const simulatorStore = createStore<SimulatorStore>((set, get) => {
  // #=========================================================================#
  // # Helpers                                                                 #
  // #=========================================================================#

  /**
   * Exit the program and notify the user if an error occurred.
   */
  const finish = (err?: SimulatorError<any>) => {
    if (err) notify(err);

    highlightLine(null);
    setReadOnly(false);
    set({ state: { type: "stopped", reason: err ? "error" : "halt" } });
  };

  /**
   * Update the simulator state in the store.
   */
  const updateSimulator = () => set({ simulator: simulator.toJSON() });

  /**
   * Run the simulator for a given amount of time.
   */
  function runSimulator(time: number) {
    const { state } = get();
    if (state.type !== "running" && state.type !== "paused") return;

    const result = simulator.run(time);
    updateSimulator();

    if (result.isErr()) {
      finish(result.unwrapErr());
      return;
    }

    const ret = result.unwrap();
    if (ret === "halt") {
      finish();
    } else if (ret === "start-debugger") {
      set({ state: { type: "paused" } });
    } else if (ret === "wait-for-input") {
      set({ state: { type: "waiting-for-input", previousState: state.type } });

      const console = document.getElementById(CONSOLE_ID)!;
      console.scrollIntoView({ behavior: "smooth" });
      console.focus({ preventScroll: true });
    }

    // ret = 'continue'
    // Do nothing
  }

  // #=========================================================================#
  // # On init                                                                 #
  // #=========================================================================#

  // When creating the store, we need to set the devices settings
  // and subscribe to changes in the settings.

  simulator.switchDevices(useSettings.getState().devices);
  useSettings.subscribe(state => {
    if (simulator.devices.id !== state.devices) {
      simulator.switchDevices(state.devices);
      updateSimulator();
    }
  });

  // #=========================================================================#
  // # State                                                                 #
  // #=========================================================================#

  return {
    simulator: simulator.toJSON(),

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
    dispatch: (...args) => {
      const action = args[0];
      const { state } = get();

      switch (action) {
        // #=========================================================================#
        // # Run/Step/Stop                                                           #
        // #=========================================================================#

        case "run":
        case "step": {
          if (state.type !== "stopped" && state.type !== "paused") {
            notify(new SimulatorError("compile-error"));
            break;
          }

          if (state.type === "stopped") {
            if (!window.codemirror) break;

            const code = window.codemirror.state.doc.toString();
            const result = compile(code);

            if (!result.success) {
              notify(new SimulatorError("compile-error"));
              break;
            }

            setReadOnly(true);

            // Get user settings
            const { memoryMode, speeds } = useSettings.getState();

            // Reset the simulator
            simulator.loadProgram({
              program: result,
              cpu: {
                speed: speeds.cpu,
                beforeInstruction: instruction => highlightLine(instruction.meta.position[0]),
              },
              memory: { mode: memoryMode },
              devices: { printerSpeed: speeds.printer },
            });

            // Highlight the ORG 2000h line
            if (result.initialStatement) highlightLine(result.initialStatement.position[0]);

            if (action === "step") set({ state: { type: "paused" } });
          }

          // By this point, the program is already loaded and
          // the user either wants to run it or step through it
          //
          // action === 'run' && state.type === ('paused' || 'stopped')
          // action === 'step' && state.type === 'paused'

          if (action === "step") {
            // Increment the current time by the CPU interval, since
            // we ran exactly one instruction
            const cpuCycleTime = Math.round(1000 / useSettings.getState().speeds.cpu);
            runSimulator(cpuCycleTime);
          } else {
            set({ state: { type: "running" } });

            const resolution = 8; // ms

            // Run the first instruction immediately (better UX)
            runSimulator(resolution);

            // Start the continuous loop
            const interval = setInterval(() => {
              if (get().state.type !== "running") {
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
          else notify(new SimulatorError("compile-error"));
          break;
        }

        // #=========================================================================#
        // # Devices actions                                                         #
        // #=========================================================================#

        case "f10.press": {
          simulator.devices.f10.press();
          break;
        }

        case "switch.toggle": {
          if (simulator.devices.id !== "switches-and-leds") throw new Error("Invalid device call");

          simulator.devices.switches.toggle(args[1]);
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

          const result = simulator.cpu.handleInt6(char);
          if (result.isErr()) {
            finish(result.unwrapErr());
            break;
          }

          const previous = state.previousState;
          set({ state: { type: "paused" } });
          get().dispatch(previous === "running" ? "run" : "step");
          break;
        }

        case "console.clean": {
          simulator.devices.console.clean();
          break;
        }

        case "printer.clean": {
          if ("printer" in simulator.devices) simulator.devices.printer.clean();
          break;
        }

        default:
          break;
      }

      updateSimulator();
    },
  };
});

function notify(error: SimulatorError<any>) {
  const lang = useSettings.getState().language;
  const message = error.translate(lang);
  toast.error(message);
}
