import clsx from "clsx";
import { useCallback } from "react";
import { useEvent, useLongPress, useToggle } from "react-use";
import { shallow } from "zustand/shallow";

import DebugIcon from "~icons/carbon/debug";
import DocumentationIcon from "~icons/carbon/document";
import ErrorIcon from "~icons/carbon/error";
import KeyboardIcon from "~icons/carbon/keyboard";
import GitHubIcon from "~icons/carbon/logo-github";
import Logo from "~icons/carbon/machine-learning";
import PausedIcon from "~icons/carbon/pause";
import RunIcon from "~icons/carbon/play";
import RunningIcon from "~icons/carbon/settings";
import FinishIcon from "~icons/carbon/skip-forward";
import AbortIcon from "~icons/carbon/stop-sign";

import { useMobile } from "../hooks/useMobile";
import { useTranslate } from "../hooks/useTranslate";
import { useRunner } from "../runner";
import { LangPicker } from "./LangPicker";

/**
 * You'll see a mix of `isMobile` and `lg:*` in this file.
 * Whenever you see `lg:*` it means that the element will behave
 * differently in mobile and desktop.
 *
 * I'd rather use pure CSS but I needed to use `isMobile`.
 */

export function Header() {
  const translate = useTranslate();
  const isMobile = useMobile();

  const [easterEgg, toggleEasterEgg] = useToggle(false);
  const easterEggEvents = useLongPress(
    () => {
      window.navigator.vibrate(100);
      toggleEasterEgg();
    },
    { isPreventDefault: true, delay: 1500 },
  );

  return (
    <header className="border-b border-slate-500/30 bg-slate-800 text-sm text-white">
      <div className="flex items-center lg:h-full">
        <div className="flex select-none items-center justify-center py-2 px-4">
          <Logo
            className={clsx("mr-2 h-8 w-8", easterEgg && "animate-spin")}
            {...easterEggEvents}
          />
          <h1 className="text-xl font-bold">
            Von<span className="text-sky-400">Sim</span>
          </h1>
        </div>

        {!isMobile && (
          <>
            <State />
            <Controls />
          </>
        )}

        <div className="grow" />

        <LangPicker />
        <a
          className="flex h-full items-center p-2 transition hover:bg-slate-500/30"
          href="/docs"
          title={translate("documentation")}
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
      </div>

      {isMobile && (
        <div className="">
          <State />
          <Controls />
        </div>
      )}
    </header>
  );
}

function State() {
  const translate = useTranslate();

  const state = useRunner(runner => runner.state);

  return (
    <div
      className={clsx(
        "mx-auto flex h-6 w-40 select-none items-center justify-center gap-1 rounded-full lg:mx-8",
        "text-center text-sm font-semibold",
        state.type === "running" && "bg-emerald-200 text-emerald-700",
        state.type === "paused" && "bg-amber-200 text-amber-700",
        state.type === "waiting-for-input" && "bg-amber-200 text-amber-700",
        state.type === "stopped" &&
          (state.reason === "halt" ? "bg-sky-200 text-sky-700" : "bg-red-200 text-red-700"),
      )}
    >
      {state.type === "running" ? (
        <RunningIcon className="h-4 w-4 animate-spin" />
      ) : state.type === "paused" ? (
        <PausedIcon className="h-4 w-4 animate-pulse" />
      ) : state.type === "waiting-for-input" ? (
        <KeyboardIcon className="h-4 w-4 animate-bounce" />
      ) : state.reason === "halt" ? (
        <AbortIcon className="h-4 w-4" />
      ) : (
        <ErrorIcon className="h-4 w-4" />
      )}
      <span>{translate(`runner.state.${state.type}`)}</span>
    </div>
  );
}

function Controls() {
  const translate = useTranslate();

  const { state, dispatch } = useRunner(
    runner => ({ state: runner.state, dispatch: runner.dispatch }),
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

  return (
    <div className="flex h-12 items-center justify-center gap-4 lg:h-full lg:justify-start">
      {state.type === "stopped" ? (
        <>
          <Button onClick={() => dispatch("run")} title="F5">
            <RunIcon /> {translate("runner.action.start")}
          </Button>

          <Button onClick={() => dispatch("step")} title="F11">
            <DebugIcon /> {translate("runner.action.debug")}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => dispatch("run")} title="F5" disabled={state.type !== "paused"}>
            <FinishIcon /> {translate("runner.action.run-until-halt")}
          </Button>

          <Button onClick={() => dispatch("step")} title="F11" disabled={state.type !== "paused"}>
            <RunIcon /> {translate("runner.action.step")}
          </Button>

          <Button onClick={() => dispatch("stop")} title="Shift+F5">
            <AbortIcon /> {translate("runner.action.stop")}
          </Button>
        </>
      )}
    </div>
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
