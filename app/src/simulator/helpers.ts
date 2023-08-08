import type { SimulatorError, SimulatorEvent as AllSimulatorEvents } from "@vonsim/simulator";
import { toast } from "sonner";

import { getSettings } from "@/lib/settings";

export type SimulatorEvent<Prefix extends string = ""> = AllSimulatorEvents & {
  type: `${Prefix}${string}`;
};

export function notifyError(error: SimulatorError<any>) {
  const message = error.translate(getSettings().language);
  toast.error(message);
}
