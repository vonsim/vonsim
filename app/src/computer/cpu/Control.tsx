import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { animated, getSpring } from "@/computer/shared/springs";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

import { cycleAtom } from "./state";

/**
 * Control component, to be used inside <CPU />
 */
export function Control() {
  const translate = useTranslate();

  const { status } = useSimulation();
  const cycle = useAtomValue(cycleAtom);

  const operandsText = useMemo(() => {
    if (!("metadata" in cycle)) return "";
    if (cycle.metadata.operands.length === 0) return "";

    if (cycle.phase === "fetching-operands") {
      let text = " __";
      for (let i = 1; i < cycle.metadata.operands.length; i++) {
        text += ", __";
      }
      return text;
    } else {
      return " " + cycle.metadata.operands.join(", ");
    }
  }, [cycle]);

  const statusKey = useMemo(() => {
    if (status.type === "running" && status.waitingForInput) return "waiting-for-input";
    if (status.type === "stopped") return status.error ? "stopped-error" : "stopped";
    if (cycle.phase === "stopped" && cycle.error) return "stopped-error";
    return cycle.phase;
  }, [status, cycle]);

  return (
    <>
      <svg viewBox="0 0 650 500" className="pointer-events-none absolute inset-0">
        <animated.path
          className="stroke-primary-1 stroke-bus fill-none"
          strokeLinejoin="round"
          d="M 205 300 V 320"
          pathLength={1}
          strokeDasharray={1}
          style={getSpring("cpu.decoder.path")}
        />
      </svg>

      <div className="absolute bottom-[172px] left-[30px] flex w-full items-start">
        <span className="bg-primary-0 border-border text-foreground block w-min whitespace-nowrap rounded-t-lg border border-b-0 px-2 pb-3 pt-1 text-xs tracking-wide">
          {translate("computer.cpu.control-unit")}
        </span>
      </div>

      <div className="border-border bg-background-1 absolute bottom-[30px] left-[30px] flex h-[150px] w-[350px] flex-col items-center rounded-lg border">
        <div className="border-border bg-background-0 overflow-hidden rounded-b-lg border border-t-0 px-4">
          <span className="text-sm leading-none">{translate("computer.cpu.decoder")}</span>
          <div className="bg-background-3 my-1 h-1 w-full overflow-hidden rounded-full">
            <animated.div
              className="bg-primary-1 h-full"
              style={{
                width: getSpring("cpu.decoder.progress.progress").to(t => `${t * 100}%`),
                opacity: getSpring("cpu.decoder.progress.opacity"),
              }}
            />
          </div>
        </div>

        <span
          className={clsx(
            "border-border mt-4 w-48 rounded-lg border py-2 text-center text-sm leading-none transition-colors",
            statusKey === "stopped-error"
              ? "bg-red-500"
              : statusKey === "waiting-for-input"
                ? "bg-amber-600"
                : statusKey === "int6" || statusKey === "int7"
                  ? "bg-blue-600"
                  : "bg-background-0",
          )}
        >
          {translate(`computer.cpu.status.${statusKey}`)}
        </span>

        <div className="border-border bg-background-0 mt-4 w-64 overflow-hidden rounded-lg border py-2">
          <p className="text-center font-mono">
            {!("metadata" in cycle) || cycle.phase === "fetching" ? (
              <span className="italic text-stone-600 dark:text-stone-400">???</span>
            ) : (
              <>
                <span className="text-primary-1">{cycle.metadata.name}</span>
                <span className="text-foreground">{operandsText}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
