import clsx from "clsx";

import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { Card } from "./Card";

export function Leds({ className }: { className?: string }) {
  const translate = useTranslate();

  const state = useSimulator(state => state.devices.leds.state);

  /**
   * We do row-reverse to show this order:
   * 7 6 5 4 3 2 1 0
   *
   * But the array is:
   * 0 1 2 3 4 5 6 7
   *
   * This way, we can use the index as the LED number
   * and the user will the LEDs as shown in the PIO.
   */

  return (
    <Card title={translate("devices.external.leds")} className={className}>
      <div className="flex flex-row-reverse gap-2">
        {state.map((on, i) => (
          <div
            key={i}
            className={clsx(
              "relative h-8 w-8 rounded-full transition",
              on ? "bg-sky-400" : "bg-sky-900",
            )}
          >
            <div
              className={clsx(
                "absolute inset-0 rounded-full bg-sky-400 blur-sm transition",
                on ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
