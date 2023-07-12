import { Card } from "@/components/common/Card";
import { useTranslate } from "@/hooks/useTranslate";
import { useAtomValue } from "@/lib/jotai";
import { cn } from "@/lib/utils";
import { ledsAtom } from "@/simulator/components/leds";

export function Leds({ className }: { className?: string }) {
  const translate = useTranslate();

  const state = useAtomValue(ledsAtom).toArray();

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
      <div className="flex flex-row-reverse gap-2 p-2">
        {state.map((on, i) => (
          <div
            key={i}
            className={cn(
              "relative h-8 w-8 rounded-full transition",
              on ? "bg-red-500" : "bg-gray-700 shadow-inner shadow-gray-900",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-full bg-red-500 blur-sm transition",
                on ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
