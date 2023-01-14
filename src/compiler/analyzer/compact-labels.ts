import { klona } from "klona";

import type { LabelAddresses } from "./compute-addresses";
import type { ProgramConstants } from "./evaluate/constants";

export type LabelMap = Map<
  string,
  { type: "constant"; value: number } | { type: "DB" | "DW" | "instruction"; address: number }
>;

export function compactLabels(addresses: LabelAddresses, constants: ProgramConstants): LabelMap {
  const labelMap: LabelMap = klona(addresses);

  for (const [label, value] of constants.entries()) {
    labelMap.set(label, { type: "constant", value });
  }

  return labelMap;
}
