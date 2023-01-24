import { Switch } from "@headlessui/react";

import { useSimulator } from "@/simulator";
import { Card } from "@/ui/components/common/Card";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { cn } from "@/ui/lib/utils";

export function Switches({ className }: { className?: string }) {
  const translate = useTranslate();

  const { state, toggle } = useSimulator(state => state.devices.switches);

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
            onChange={() => toggle(i)}
            className={cn(
              "relative inline-flex h-14 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
              on ? "bg-sky-400" : "bg-sky-900",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-100 ease-in-out",
                on ? "translate-y-0" : "translate-y-6",
              )}
            />
          </Switch>
        ))}
      </div>
    </Card>
  );
}
