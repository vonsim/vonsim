import { useAtomValue } from "@/lib/jotai";
import { dispatch, simulatorStateAtom } from "@/simulator/state";

export function useSimulator() {
  const status = useAtomValue(simulatorStateAtom);
  return [status, dispatch] as const;
}
