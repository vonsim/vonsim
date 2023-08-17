import { ChipSelect } from "./ChipSelect";
import { ControlLines, ControlLinesLegends } from "./ControlLines";
import { DataLines } from "./DataLines";

export function SystemBus() {
  return (
    <>
      <DataLines />
      <ControlLines />
      <ControlLinesLegends />
      <ChipSelect />
    </>
  );
}
