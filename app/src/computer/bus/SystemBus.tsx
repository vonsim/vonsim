import { ChipSelect } from "./ChipSelect";
import { ControlLines } from "./ControlLines";
import { DataLines } from "./DataLines";

export function SystemBus() {
  return (
    <>
      <DataLines />
      <ControlLines />
      <ChipSelect />
    </>
  );
}
