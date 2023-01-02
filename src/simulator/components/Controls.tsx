import clsx from "clsx";
import { useCallback } from "react";
import { useEvent, useLongPress, useToggle } from "react-use";
import shallow from "zustand/shallow";
import DebugIcon from "~icons/carbon/debug";
import DocumentationIcon from "~icons/carbon/document";
import GitHubIcon from "~icons/carbon/logo-github";
import Logo from "~icons/carbon/machine-learning";
import PausedIcon from "~icons/carbon/pause";
import RunIcon from "~icons/carbon/play";
import RunningIcon from "~icons/carbon/settings";
import FinishIcon from "~icons/carbon/skip-forward";
import AbortIcon from "~icons/carbon/stop-sign";
import { useComputer } from "../computer";

export function Controls() {
  const { state, dispatch } = useComputer(
    state => ({
      state: state.runnerState,
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
        {state === "stopped" ? (
          <>
            <Button onClick={() => dispatch("run")} title="F5">
              <RunIcon /> Ejecutar
            </Button>

            <Button onClick={() => dispatch("step")} title="F11">
              <DebugIcon /> Depurar
            </Button>
          </>
        ) : state === "running" ? (
          <>
            <div className="flex h-6 w-32 select-none items-center justify-center rounded-lg bg-sky-500 text-white">
              <RunningIcon className="mr-1 h-4 w-4 animate-spin" />
              <span className="text-center text-xs font-bold uppercase tracking-wider">
                Ejecutando
              </span>
            </div>

            <div className="w-4" />

            <Button onClick={() => dispatch("stop")} title="Shift+F5">
              <AbortIcon /> Abortar
            </Button>
          </>
        ) : (
          <>
            <div className="flex h-6 w-32 animate-pulse select-none items-center justify-center rounded-lg bg-sky-500 text-white">
              <PausedIcon className="mr-1 h-4 w-4" />
              <span className="text-center text-xs font-bold uppercase tracking-wider">
                Pausado
              </span>
            </div>

            <div className="w-4" />

            <Button onClick={() => dispatch("step")} title="F11">
              <RunIcon /> Siguiente
            </Button>

            <Button onClick={() => dispatch("run")} title="F5">
              <FinishIcon /> Finalizar
            </Button>

            <Button onClick={() => dispatch("stop")} title="Shift+F5">
              <AbortIcon /> Abortar
            </Button>
          </>
        )}
      </div>

      <div className="grow" />

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
        "[&>svg]:mr-1 [&>svg]:h-5 [&>svg]:w-5",
      )}
    >
      {children}
    </button>
  );
}
