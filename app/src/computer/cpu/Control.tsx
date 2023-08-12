import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { animated, getSpring } from "@/computer/shared/springs";
import { useSimulation } from "@/hooks/useSimulation";
import { useTranslate } from "@/hooks/useTranslate";

import { cycleAtom } from "./state";

/**
 * Control component, to be used inside <CPU />
 */
export function Control() {
  const translate = useTranslate();

  const [status] = useSimulation();
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
      <svg viewBox="0 0 650 500" className="absolute inset-0">
        <animated.path
          className="fill-none stroke-mantis-400 stroke-bus"
          strokeLinejoin="round"
          d="M 205 300 V 320"
          pathLength={1}
          strokeDasharray={1}
          style={getSpring("cpu.decoder.path")}
        />
      </svg>

      <div className="absolute bottom-[172px] left-[30px] flex w-full items-start">
        <span className="block w-min whitespace-nowrap rounded-t-lg border border-b-0 border-stone-600 bg-mantis-500 px-2 pb-3 pt-1 text-xs font-semibold tracking-wide text-white">
          {translate("computer.cpu.control-unit")}
        </span>
      </div>

      <div className="absolute bottom-[30px] left-[30px] flex h-[150px] w-[350px] flex-col items-center rounded-lg border border-stone-600 bg-stone-800">
        <div className="overflow-hidden rounded-b-lg border border-t-0 border-stone-600 bg-stone-900 px-4">
          <span className="text-sm leading-none">{translate("computer.cpu.decoder")}</span>
          <div className="my-1 h-1 w-full overflow-hidden rounded-full bg-stone-600">
            <animated.div
              className="h-full bg-mantis-400"
              style={{
                width: getSpring("cpu.decoder.progress.progress").to(t => `${t * 100}%`),
                opacity: getSpring("cpu.decoder.progress.opacity"),
              }}
            />
          </div>
        </div>

        <span
          className={clsx(
            "mt-4 w-48 rounded-lg border border-stone-600 bg-stone-900 py-2 text-center text-sm leading-none transition-colors",
            statusKey === "stopped-error" && "bg-red-500",
            statusKey === "waiting-for-input" && "bg-amber-600",
          )}
        >
          {translate(`computer.cpu.status.${statusKey}`)}
        </span>

        <div className="mt-4 w-64 overflow-hidden rounded-lg border border-stone-600 bg-stone-900 py-2">
          <p className="text-center font-mono">
            {cycle.phase === "fetching" || cycle.phase === "stopped" ? (
              <span className="font-bold italic text-stone-400">???</span>
            ) : (
              <>
                <span className="font-bold text-mantis-400">{cycle.metadata.name}</span>
                <span className="text-white">{operandsText}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
