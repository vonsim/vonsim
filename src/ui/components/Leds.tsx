import clsx from "clsx";

import { useSimulator } from "@/simulator";

import { Card } from "./Card";

export function Leds({ className }: { className?: string }) {
  const leds = useSimulator(state => state.devices.leds.state);

  return (
    <Card title="Leds" className={className}>
      <div className="flex gap-2">
        {leds.map((on, i) => (
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
