import { useAtom } from "jotai";
import { useCallback } from "react";
import { useEvent } from "react-use";

import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";
import { speedsAtom } from "@/lib/settings";
import { newStart } from "@/simulator/state";

export function Controls() {
  const translate = useTranslate();
  const [speeds, setSpeeds] = useAtom(speedsAtom);

  const [status, dispatch] = useSimulator();

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
    <div className="flex items-center justify-center gap-4 lg:h-full lg:justify-start">
      <button
        className="flex w-min items-center gap-1 rounded-md bg-lime-800 p-2 text-lime-50 transition-colors hover:enabled:bg-lime-600 hover:enabled:text-white disabled:opacity-40"
        disabled={status.type !== "stopped"}
        onClick={newStart}
      >
        <span className="icon-[lucide--play] block h-5 w-5" />
        <span className="whitespace-nowrap font-semibold tracking-wide">
          {translate("runner.action.start")}
        </span>
      </button>

      <input
        type="range"
        className="rotate-180"
        min={5}
        max={300}
        step={5}
        value={speeds.executionUnit}
        onChange={e => setSpeeds({ ...speeds, executionUnit: e.currentTarget.valueAsNumber })}
      />
    </div>
  );
}
