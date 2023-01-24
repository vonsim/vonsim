import clsx from "clsx";
import { useCallback } from "react";
import { useEvent } from "react-use";
import { shallow } from "zustand/shallow";

import { useTranslate } from "@/ui/hooks/useTranslate";
import { useRunner } from "@/ui/runner";
import DebugIcon from "~icons/carbon/debug";
import RunIcon from "~icons/carbon/play";
import FinishIcon from "~icons/carbon/skip-forward";
import AbortIcon from "~icons/carbon/stop-sign";

export function Controls() {
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
