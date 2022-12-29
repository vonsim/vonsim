import toast from "react-hot-toast";
import create from "zustand";
import { compile } from "~/compiler";
import { highlightLine, setReadOnly } from "../editor/methods";
import { useComputer } from "../environment/computer";
import { useConfig } from "../environment/config";

type ExecutionStore = {
  state: "running" | "paused" | "stopped";
  abortRequested: boolean;
  compile: () => void;
  runForever: () => Promise<void>;
  runStep: () => void;
  abort: () => void;
  finish: () => void;
};

export const useExecution = create<ExecutionStore>()((set, get) => ({
  state: "stopped",
  abortRequested: false,
  compile: () => {
    const code = window.codemirror!.state.doc.toString();
    const result = compile(code);

    if (!result.success) {
      toast.error("Error de compilación. Solucioná los errores y volvé a intentar");
      return;
    }

    useComputer.getState().loadProgram(result);
    setReadOnly(true);
  },
  finish: () => {
    highlightLine(null);
    setReadOnly(false);
    set({ state: "stopped", abortRequested: false });
  },
  runForever: async () => {
    if (get().state === "running") return;
    set({ state: "running" });

    while (true) {
      const keepRunning = useComputer.getState().runInstruction();
      await new Promise(resolve => {
        // I know it's not efficient, but it  doesn't
        // affect the performance of the app
        const ms = 1000 / useConfig.getState().clockSpeed;
        setTimeout(resolve, ms);
      });

      if (!keepRunning || get().abortRequested) break;
    }

    get().finish();
  },
  runStep: () => {
    if (get().state === "running") return;
    const keepRunning = useComputer.getState().runInstruction();

    if (keepRunning) set({ state: "paused" });
    else get().finish();
  },
  abort: () => {
    if (get().state === "running") set({ abortRequested: true });
    else get().finish();
  },
}));
