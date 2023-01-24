import clsx from "clsx";

import { useTranslate } from "@/ui/hooks/useTranslate";
import { useRunner } from "@/ui/runner";
import ErrorIcon from "~icons/carbon/error";
import KeyboardIcon from "~icons/carbon/keyboard";
import PausedIcon from "~icons/carbon/pause";
import RunningIcon from "~icons/carbon/settings";
import AbortIcon from "~icons/carbon/stop-sign";

export function State() {
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
