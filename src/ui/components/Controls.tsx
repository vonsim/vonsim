import clsx from "clsx";
import { useCallback } from "react";
import { useEvent, useLongPress, useToggle } from "react-use";
import { shallow } from "zustand/shallow";

import { useSimulator } from "@/simulator";
import DebugIcon from "~icons/carbon/debug";
import DocumentationIcon from "~icons/carbon/document";
import KeyboardIcon from "~icons/carbon/keyboard";
import GitHubIcon from "~icons/carbon/logo-github";
import Logo from "~icons/carbon/machine-learning";
import PausedIcon from "~icons/carbon/pause";
import RunIcon from "~icons/carbon/play";
import RunningIcon from "~icons/carbon/settings";
import FinishIcon from "~icons/carbon/skip-forward";
import AbortIcon from "~icons/carbon/stop-sign";

import { LangPicker } from "./LangPicker";

export function Controls() {
  const { state, dispatch } = useSimulator(
    state => ({
      state: state.runner,
      dispatch: state.dispatchRunner,
    }),
    shallow,
  );

  const onKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key === "F5") {
        ev.preventDefault();
        if (ev.shiftKey) dispatch("stop");
        else dispatch("run");
      } else if (ev.key === "F11") {
        ev.preventDefault();
        dispatch("step");
      }
    },
    [dispatch],
  );

  useEvent("keydown", onKeyDown, undefined, [dispatch]);

  const [easterEgg, toggleEasterEgg] = useToggle(false);
  const easterEggEvents = useLongPress(
    () => {
      window.navigator.vibrate(100);
      toggleEasterEgg();
    },
    { isPreventDefault: true, delay: 1500 },
  );

  return (
    <header className="flex items-center border-b border-slate-500/30 bg-slate-800 text-sm text-white">
      <div className="flex select-none items-center justify-center py-2 pl-4 pr-12">
        <Logo className={clsx("mr-2 h-8 w-8", easterEgg && "animate-spin")} {...easterEggEvents} />
        <h1 className="text-xl font-bold">
          Von<span className="text-sky-400">Sim</span>
        </h1>
      </div>

      <div className="flex h-full items-center gap-4">
        <State />

        {state === "stopped" ? (
          <>
            <Button onClick={() => dispatch("run")} title="F5">
              <RunIcon /> Ejecutar
            </Button>

            <Button onClick={() => dispatch("step")} title="F11">
              <DebugIcon /> Depurar
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => dispatch("run")} title="F5" disabled={state !== "paused"}>
              <FinishIcon /> Finalizar
            </Button>

            <Button onClick={() => dispatch("step")} title="F11" disabled={state !== "paused"}>
              <RunIcon /> Siguiente
            </Button>

            <Button onClick={() => dispatch("stop")} title="Shift+F5">
              <AbortIcon /> Abortar
            </Button>
          </>
        )}
      </div>

      <div className="grow" />

      <LangPicker />
      <a
        className="flex h-full items-center p-2 transition hover:bg-slate-500/30"
        href="/docs"
        target="_blank"
        title="Documentación"
      >
        <DocumentationIcon className="h-5 w-5" />
      </a>
      <a
        className="mr-4 flex h-full items-center p-2 transition hover:bg-slate-500/30"
        href="https://github.com/vonsim/vonsim"
        target="_blank"
        title="GitHub"
        rel="noreferrer"
      >
        <GitHubIcon className="h-5 w-5" />
      </a>
    </header>
  );
}

function Button({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        "flex h-full items-center justify-center border-b border-sky-400 p-2 transition hover:bg-slate-500/30",
        "disabled:border-slate-500 disabled:text-slate-500 disabled:hover:bg-transparent",
        "[&>svg]:mr-1 [&>svg]:h-5 [&>svg]:w-5",
        className,
      )}
    >
      {children}
    </button>
  );
}

function State() {
  const state = useSimulator(state => state.runner);

  return (
    <div
      className={clsx(
        "mr-4 flex h-6 w-40 select-none items-center justify-center gap-1 rounded-full",
        "text-center text-sm font-semibold",
        state === "running" && "bg-emerald-200 text-emerald-700",
        state === "paused" && "bg-amber-200 text-amber-700",
        state === "waiting-for-input" && "bg-amber-200 text-amber-700",
        state === "stopped" && "bg-sky-200 text-sky-700",
      )}
    >
      {state === "running" ? (
        <>
          <RunningIcon className="h-4 w-4 animate-spin" />
          <span>Ejecutando</span>
        </>
      ) : state === "paused" ? (
        <>
          <PausedIcon className="h-4 w-4 animate-pulse" />
          <span>Pausado</span>
        </>
      ) : state === "waiting-for-input" ? (
        <>
          <KeyboardIcon className="h-4 w-4 animate-bounce" />
          <span>Esperando tecla</span>
        </>
      ) : (
        <>
          <AbortIcon className="h-4 w-4" />
          <span>Detenido</span>
        </>
      )}
    </div>
  );
}
