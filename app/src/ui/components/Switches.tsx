import { Switch } from "@headlessui/react";

import { Card } from "@/ui/components/common/Card";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { cn } from "@/ui/lib/utils";

export function Switches({ className }: { className?: string }) {
  const translate = useTranslate();

  const result = useSimulator(s => {
    if ("switches" in s.simulator.devices) {
      return { state: s.simulator.devices.switches, dispatch: s.dispatch };
    } else {
      return null;
    }
  });

  // Switches are not connected
  if (!result) return null;

  const { state, dispatch } = result;

  /**
   * We do row-reverse to show this order:
   * 7 6 5 4 3 2 1 0
   *
   * But the array is:
   * 0 1 2 3 4 5 6 7
   *
   * This way, we can use the index as the switch number
   * and the user will the switches as shown in the PIO.
   */

  return (
    <Card title={translate("devices.external.switches")} className={className}>
      <div className="flex flex-row-reverse gap-2 p-2">
        {state.map((on, i) => (
          <Switch
            key={i}
            checked={on}
            onChange={() => dispatch("switch.toggle", i)}
            className={cn(
              "relative inline-flex h-14 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
              "transition-colors duration-300 ease-realistic focus:outline-none",
              "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
              on ? "bg-red-600" : "bg-gray-700",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0",
                "transition-transform duration-200 ease-realistic-bounce",
                on ? "translate-y-0" : "translate-y-6",
              )}
            />
          </Switch>
        ))}
      </div>
    </Card>
  );
}