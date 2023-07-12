import { Leds } from "./Leds";
import { Switches } from "./Switches";

export function SwitchesAndLeds() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Switches />
      <Leds />
    </div>
  );
}
