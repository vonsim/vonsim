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
    <div className="**:z-20 border-border bg-background-0 absolute left-[1300px] top-[700px] z-10 size-min rounded-lg border">
      <span className="bg-primary-0 border-border text-foreground block size-min rounded-br-lg rounded-tl-lg border-b border-r px-2 py-1 text-2xl">
        {translate("computer.leds")}
      </span>

      <div className="flex flex-row-reverse gap-2 p-4">
        {state.map((on, i) => (
          <div
            key={i}
            className={clsx(
              "relative size-7 rounded-full transition",
              on
                ? "bg-primary-1"
                : "bg-background-2 shadow-background-3 dark:shadow-background-0 shadow-inner",
            )}
          >
            <div
              className={clsx(
                "bg-primary-1 blur-xs absolute inset-0 rounded-full transition",
                on ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
