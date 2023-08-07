import clsx from "clsx";

import { animationRefs } from "@/simulator/computer/shared/references";
import { Register } from "@/simulator/computer/shared/Register";

import { COMPAtom, CONTAtom } from "./state";

export function Timer({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "absolute z-10 flex h-[120px] w-[220px] rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20",
        className,
      )}
    >
      <span className="block h-min w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-2xl font-bold text-white">
        Timer
      </span>

      <div className="flex h-full w-full flex-col items-center justify-evenly">
        <Register name="CONT" valueAtom={CONTAtom} springRef={animationRefs.timer.CONT} />
        <Register name="COMP" valueAtom={COMPAtom} springRef={animationRefs.timer.COMP} />
      </div>
    </div>
  );
}
