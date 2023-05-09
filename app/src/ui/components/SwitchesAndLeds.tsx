import { useSimulator } from "@/ui/hooks/useSimulator";

import { Leds } from "./Leds";
import { Switches } from "./Switches";

export function SwitchesAndLeds() {
  const connected = useSimulator(s => s.simulator.devices.id === "switches-and-leds");

  if (!connected) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <Switches />
      <Leds />
    </div>
  );
}
