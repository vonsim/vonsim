import { useStore } from "zustand";
import { shallow } from "zustand/shallow";

import { SimulatorStore, simulatorStore } from "@/ui/lib/simulator";

export function useSimulator<Slice>(slice: (s: SimulatorStore) => Slice) {
  return useStore(simulatorStore, slice, shallow);
}
