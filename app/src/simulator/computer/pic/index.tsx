import clsx from "clsx";

import { animationRefs } from "@/simulator/computer/shared/references";
import { Register } from "@/simulator/computer/shared/Register";

import { IMRAtom, IRRAtom, ISRAtom, linesAtoms } from "./state";

export function PIC({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "absolute z-10 flex h-[200px] w-[450px] flex-col rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20",
        className,
      )}
    >
      <div className="flex items-start">
        <span className="block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-2xl font-bold text-white">
          PIC
        </span>

        <div className="flex h-16 grow items-center justify-evenly">
          <Register name="IMR" valueAtom={IMRAtom} springRef={animationRefs.pic.IMR} emphasis />
          <Register name="IRR" valueAtom={IRRAtom} springRef={animationRefs.pic.IRR} emphasis />
          <Register name="ISR" valueAtom={ISRAtom} springRef={animationRefs.pic.ISR} emphasis />
        </div>
      </div>

      <hr className="mb-2 border-stone-600" />

      <div className="grid h-full w-full grid-cols-4 items-center">
        {linesAtoms.map((atom, i) => (
          <Register
            key={i}
            name={`INT${i}`}
            valueAtom={atom}
            springRef={animationRefs.pic[`INT${i}` as "INT0"]}
            className="mx-auto"
          />
        ))}
      </div>
    </div>
  );
}
