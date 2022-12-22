import type { LabelAddresses } from "./compute-addresses";
import type { ProgramConstants } from "./evaluate/constants";
import type { LabelTypes } from "./get-label-types";

export type LabelMap = Map<
  string,
  { type: "constant"; value: number } | { type: "DB" | "DW" | "instruction"; address: number }
>;

export function compactLabels(
  types: LabelTypes,
  addresses: LabelAddresses,
  constants: ProgramConstants,
): LabelMap {
  const labelMap: LabelMap = new Map();

  for (const [label, type] of types.entries()) {
    if (type === "EQU") {
      const value = constants.get(label)!;
      labelMap.set(label, { type: "constant", value });
    } else {
      const address = addresses.get(label)!;
      labelMap.set(label, { type, address });
    }
  }

  return labelMap;
}
