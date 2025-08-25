import clsx from "clsx";
import { useCallback } from "react";
import { useKey } from "react-use";

import { RunUntil, useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

export function Controls({ className }: { className?: string }) {
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <div className="bg-background-1 border-border flex h-12 grid-cols-4 items-center rounded-md border">
        <RunButton until="cycle-change" shortcut="F7" icon="icon-[lucide--play]" />
        <RunButton until="end-of-instruction" shortcut="F8" icon="icon-[lucide--skip-forward]" />
        <RunButton until="infinity" shortcut="F4" icon="icon-[lucide--infinity]" />
        <StopButton />
      </div>
    </div>
  );
}

function PauseButton({ shortcut }: { shortcut: string }) {
  const translate = useTranslate();
  const { status, dispatch } = useSimulation();

  const pause = useCallback(() => {
    if (status.type !== "running") return;
    dispatch("cpu.pause");
  }, [status.type, dispatch]);

  useKey(
    shortcut,
    ev => {
      ev.preventDefault();
      pause();
    },
    undefined,
    [pause, shortcut],
  );

  return (
    <button
      className="hover:bg-background-2 py-1.25 flex size-full flex-col items-center justify-between rounded-md transition-colors"
      onClick={pause}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="icon-[lucide--pause] size-5 text-amber-600" />
        <kbd className="hidden font-mono text-[0.6rem] leading-none text-stone-600 sm:block dark:text-stone-400">
          {shortcut}
        </kbd>
      </div>
      <span className="block text-xs leading-none">{translate("control.action.stop")}</span>
    </button>
  );
}

function RunButton({ until, shortcut, icon }: { until: RunUntil; shortcut: string; icon: string }) {
  const translate = useTranslate();
  const { status, dispatch } = useSimulation();

  const run = useCallback(() => {
    if (status.type === "running") return;
    dispatch("cpu.run", until);
  }, [status.type, dispatch, until]);

  useKey(
    shortcut,
    ev => {
      ev.preventDefault();
      run();
    },
    undefined,
    [run, shortcut],
  );

  if (status.type === "running" && status.until === until) {
    return <PauseButton shortcut={shortcut} />;
  }

  return (
    <button
      className="enabled:hover:bg-background-2 py-1.25 flex size-full flex-col items-center justify-between rounded-md transition-colors disabled:opacity-50"
      onClick={run}
      disabled={status.type === "running"}
    >
      <div className="flex items-center justify-center gap-1">
        <span className={clsx(icon, "text-primary-1 size-5")} />
        <kbd className="hidden font-mono text-[0.6rem] leading-none text-stone-600 sm:block dark:text-stone-400">
          {shortcut}
        </kbd>
      </div>
      <span className="block text-xs leading-none">{translate(`control.action.${until}`)}</span>
    </button>
  );
}

function StopButton() {
  const translate = useTranslate();
  const { status, dispatch } = useSimulation();

  const stop = useCallback(() => {
    if (status.type === "stopped") return;
    dispatch("cpu.stop");
  }, [status.type, dispatch]);

  useKey(
    "F9",
    ev => {
      ev.preventDefault();
      stop();
    },
    undefined,
    [stop],
  );

  return (
    <button
      className="enabled:hover:bg-background-2 py-1.25 flex size-full flex-col items-center justify-between rounded-md transition-colors disabled:opacity-50"
      onClick={stop}
      disabled={status.type === "stopped"}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="icon-[lucide--octagon-x] text-destructive size-5" />
        <kbd className="hidden font-mono text-[0.6rem] leading-none text-stone-600 sm:block dark:text-stone-400">
          F9
        </kbd>
      </div>
      <span className="block text-xs leading-none">{translate("control.action.abort")}</span>
    </button>
  );
}
