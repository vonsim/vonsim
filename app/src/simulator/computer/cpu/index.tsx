import type { PhysicalRegister } from "@vonsim/simulator/cpu";
import clsx from "clsx";

import { Register } from "@/simulator/computer/shared/Register";

import { AddressBus } from "./AddressBus";
import { ALU } from "./ALU";
import { Control } from "./Control";
import { DataBus } from "./DataBus";
import { registerAtoms } from "./state";

export function CPU({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "absolute z-10 h-[500px] w-[650px] rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20",
        className,
      )}
    >
      <span className="block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-3xl font-bold text-white">
        CPU
      </span>

      <AddressBus />
      <DataBus />

      <Reg name="left" className="left-[60px] top-[70px]" />
      <Reg name="right" className="left-[60px] top-[130px]" />
      <Reg name="result" className="left-[300px] top-[100px]" />

      <ALU />

      <Reg name="AX" emphasis className="left-[520px] top-[30px]" />
      <Reg name="BX" emphasis className="left-[520px] top-[70px]" />
      <Reg name="CX" emphasis className="left-[520px] top-[110px]" />
      <Reg name="DX" emphasis className="left-[520px] top-[150px]" />
      <Reg name="id" className="left-[520px] top-[190px]" />

      <Reg name="MBR" className="right-[-38px] top-[233px]" />

      <Reg name="IR" className="left-[171px] top-[270px]" />

      <Control />

      <Reg name="IP" emphasis className="left-[450px] top-[292px]" />
      <Reg name="SP" emphasis className="left-[450px] top-[332px]" />
      <Reg name="ri" className="left-[450px] top-[372px]" />

      <Reg name="MAR" className="right-[-51px] top-[333px]" />
    </div>
  );
}

function Reg({
  name,
  emphasis,
  className,
}: {
  name: PhysicalRegister | "MAR" | "MBR";
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <Register
      name={name}
      valueAtom={registerAtoms[name]}
      springs={`cpu.${name}`}
      emphasis={emphasis}
      className={clsx("absolute", className)}
    />
  );
}
