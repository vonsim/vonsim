import { Card } from "@/ui/components/common/Card";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { cn } from "@/ui/lib/utils";

export function Leds({ className }: { className?: string }) {
  const translate = useTranslate();

  const state = useSimulator(s => {
    if ("leds" in s.simulator.devices) return s.simulator.devices.leds;
    else return null;
  });

  // Leds are not connected
  if (!state) return null;

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
              on ? "bg-sky-400" : "bg-sky-900",
            )}
          >
            <div
              className={cn(
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
