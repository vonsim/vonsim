import clsx from "clsx";

import { ChipSelect } from "./ChipSelect";
import { ControlLines } from "./ControlLines";
import { DataLines } from "./DataLines";

export type ControlLine = { strokeDashoffset: number; opacity: number };

export function SystemBus({ className }: { className?: string }) {
  return (
    <div className={clsx("absolute", className)}>
      <DataLines className="inset-0" />
      <ControlLines className="inset-0" />
      <ChipSelect className="left-[500px] top-[525px]" />
    </div>
  );
}
