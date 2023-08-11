import { useAtomValue } from "jotai";

import { dispatch, simulationAtom } from "@/computer/state";

export function useSimulation() {
  const status = useAtomValue(simulationAtom);
  return [status, dispatch] as const;
}
