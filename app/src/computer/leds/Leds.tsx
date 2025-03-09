import clsx from "clsx";
import { useAtomValue } from "jotai";

import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/lib/i18n";

import { ledsAtom } from "./state";

export function Leds() {
  const translate = useTranslate();
  const { devices } = useSimulation();
  const state = useAtomValue(ledsAtom).toArray();

  if (!devices.leds) return null;

  /**
   * We do `flex-row-reverse` to show this order:
   * 7 6 5 4 3 2 1 0
   *
   * Because the array is:
   * 0 1 2 3 4 5 6 7
   *
   * This way, we can use the index as the LED number
   * and the user will the LEDs as shown on the PIO.
   */

  return (
    <div className="absolute left-[1300px] top-[700px] z-10 size-min rounded-lg border border-stone-600 bg-stone-900 **:z-20">
      <span className="block size-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-2xl text-white">
        {translate("computer.leds")}
      </span>

      <div className="flex flex-row-reverse gap-2 p-4">
        {state.map((on, i) => (
          <div
            key={i}
            className={clsx(
              "relative size-7 rounded-full transition",
              on ? "bg-mantis-400" : "bg-stone-700 shadow-inner shadow-stone-900",
            )}
          >
            <div
              className={clsx(
                "absolute inset-0 rounded-full bg-mantis-400 blur-xs transition",
                on ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
