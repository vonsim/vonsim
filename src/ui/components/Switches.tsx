import { Switch } from "@headlessui/react";
import clsx from "clsx";

import { useSimulator } from "@/simulator";

import { Card } from "./Card";

export function Switches({ className }: { className?: string }) {
  const switches = useSimulator(state => state.devices.switches.state);
  const toggle = useSimulator(state => state.devices.switches.toggle);

  return (
    <Card title="Teclas" className={className}>
      <div className="flex gap-2">
        {switches.map((on, i) => (
          <Switch
            key={i}
            checked={on}
            onChange={() => toggle(i)}
            className={clsx(
              "relative inline-flex h-14 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
              on ? "bg-sky-400" : "bg-sky-900",
            )}
          >
            <span
              aria-hidden="true"
              className={clsx(
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
