import clsx from "clsx";
import { useAtomValue } from "jotai";

import { useDevices } from "@/hooks/useSettings";
import { useTranslate } from "@/hooks/useTranslate";

import { ledsAtom } from "./state";

export function Leds({ className }: { className?: string }) {
  const translate = useTranslate();
  const devices = useDevices();
  const state = useAtomValue(ledsAtom).toArray();

  if (devices !== "pio-switches-and-leds") return null;

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
    <div
      className={clsx(
        "absolute z-10 h-min w-min rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20",
        className,
      )}
    >
      <span className="block h-min w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-2xl font-bold text-white">
        {translate("computer.leds")}
      </span>

      <div className="flex flex-row-reverse gap-2 p-4">
        {state.map((on, i) => (
          <div
            key={i}
            className={clsx(
              "relative h-7 w-7 rounded-full transition",
              on ? "bg-mantis-400" : "bg-stone-700 shadow-inner shadow-stone-900",
            )}
          >
            <div
              className={clsx(
                "absolute inset-0 rounded-full bg-mantis-400 blur-sm transition",
                on ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
