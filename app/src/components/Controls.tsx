import clsx from "clsx";
import { useCallback } from "react";
import { useKey } from "react-use";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

export function Controls({ className }: { className?: string }) {
  const translate = useTranslate();
  const { status, dispatch } = useSimulation();

  const runCycle = useCallback(() => {
    if (status.type === "running") return;
    dispatch("cpu.run", "cycle-change");
  }, [status.type, dispatch]);
  useKey(
    "F7",
    ev => {
      ev.preventDefault();
      runCycle();
    },
    undefined,
    [runCycle],
  );

  const runInstruction = useCallback(() => {
    if (status.type === "running") return;
    dispatch("cpu.run", "end-of-instruction");
  }, [status.type, dispatch]);
  useKey(
    "F8",
    ev => {
      ev.preventDefault();
      runInstruction();
    },
    undefined,
    [runInstruction],
  );

  const runInfinity = useCallback(() => {
    if (status.type === "running") return;
    dispatch("cpu.run", "infinity");
  }, [status.type, dispatch]);
  useKey(
    "F4",
    ev => {
      ev.preventDefault();
      runInfinity();
    },
    undefined,
    [runInfinity],
  );

  return (
    <div className={clsx("flex items-center justify-center gap-4", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={status.type === "running"}
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-mantis-500 px-3 text-sm text-white ring-offset-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mantis-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {status.type === "stopped" ? (
              <>
                <span className="icon-[lucide--play] mr-2 size-4" />
                {translate("control.action.start")}
              </>
            ) : status.type === "paused" ? (
              <>
                <span className="icon-[lucide--play] mr-2 size-4" />
                {translate("control.action.continue")}
              </>
            ) : (
              <>
                <span className="icon-[lucide--refresh-cw] mr-2 size-4 animate-spin" />
                {translate("control.action.running")}
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuItem disabled={status.type === "running"} onClick={runCycle}>
            <span className="icon-[lucide--chevron-right] mr-2 size-4" />
            {translate("control.action.run.cycle-change")}
            <div className="grow" />
            <kbd className="text-stone-600">F7</kbd>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={status.type === "running"} onClick={runInstruction}>
            <span className="icon-[lucide--chevrons-right] mr-2 size-4" />
            {translate("control.action.run.end-of-instruction")}
            <div className="grow" />
            <kbd className="text-stone-600">F8</kbd>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={status.type === "running"} onClick={runInfinity}>
            <span className="icon-[lucide--infinity] mr-2 size-4" />
            {translate("control.action.run.infinity")}
            <div className="grow" />
            <kbd className="text-stone-600">F4</kbd>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        disabled={status.type === "stopped"}
        onClick={() => dispatch("cpu.stop")}
        className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-mantis-500 px-3 text-sm text-white ring-offset-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mantis-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="icon-[lucide--stop-circle] mr-2 size-4" />
        {translate("control.action.stop")}
      </button>
    </div>
  );
}
