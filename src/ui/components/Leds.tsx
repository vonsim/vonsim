import clsx from "clsx";
import { useEffect, useState } from "react";

import { useSimulator } from "@/simulator";

import { Card } from "./Card";

export function Leds() {
  const PB = useSimulator(state => state.devices.pio.PB);
  const CB = useSimulator(state => state.devices.pio.CB);
  const [leds, setLeds] = useState(() =>
    Array.from({ length: 8 }, (_, i) => (PB & (0b1000_0000 >> i)) !== 0),
  );

  useEffect(() => {
    const changes: (boolean | null)[] = [];
    for (let i = 0; i < 8; i++) {
      const mask = 0b1000_0000 >> i;

      // bit & 1 === true => bit = 1 => it's an input, and it needs to be an output
      if (CB & mask) changes.push(null);
      else if (PB & mask) changes.push(true);
      else changes.push(false);
    }
    setLeds(leds => leds.map((on, i) => changes[i] ?? on));
  }, [PB, CB]);

  return (
    <Card title="Leds">
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
