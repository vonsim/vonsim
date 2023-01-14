import { Switch } from "@headlessui/react";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { tdeep } from "tdeep";
import { useComputer } from "~/simulator";
import { Card } from "./Card";

let cache: any = [];

export function Switches() {
  const PA = useComputer(state => state.devices.pio.PA);
  const CA = useComputer(state => state.devices.pio.CA);
  const [switches, setSwitches] = useState(() =>
    Array.from({ length: 8 }, (_, i) => (PA & (0b1000_0000 >> i)) !== 0),
  );

  const enabled = useMemo(() => {
    let enabled: boolean[] = [];
    for (let i = 0; i < 8; i++) {
      const mask = 0b1000_0000 >> i;
      // if === 0, the bit is an output, hence, it's disabled
      enabled.push((CA & mask) !== 0);
    }
    return enabled;
  }, [CA]);

  useEffect(() => {
    let changes: (boolean | null)[] = [];
    for (let i = 0; i < 8; i++) {
      const mask = 0b1000_0000 >> i;

      if (!enabled[i]) changes.push(null);
      else if (PA & mask) changes.push(true);
      else changes.push(false);
    }
    setSwitches(switches => switches.map((on, i) => changes[i] ?? on));
  }, [...enabled, PA]);

  const toggle = useCallback(
    (i: number) => {
      const mask = 0b1000_0000 >> i;
      if (enabled[i]) useComputer.setState(tdeep("devices.pio.PA", PA ^ mask));
    },
    [...enabled, PA],
  );

  return (
    <Card title="Teclas">
      <div className="flex gap-2">
        {switches.map((on, i) => (
          <Switch
            key={i}
            checked={on}
            onChange={() => toggle(i)}
            className={clsx(
              "relative inline-flex h-14 w-8 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
              !enabled[i]
                ? "cursor-default bg-slate-500"
                : on
                ? "cursor-pointer bg-sky-400"
                : "cursor-pointer bg-sky-900",
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
