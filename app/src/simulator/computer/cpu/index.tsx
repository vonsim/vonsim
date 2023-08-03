import { animated, useSpring } from "@react-spring/web";
import type { PhysicalRegister } from "@vonsim/simulator/cpu";
import clsx from "clsx";
import { useAtomValue } from "jotai";

import { colors } from "@/lib/tailwind";
import { animationRefs } from "@/simulator/computer/references";

import { ALU } from "./ALU";
import { Control } from "./Control";
import { InternalBus } from "./InternalBus";
import { cycleAtom, registerAtoms } from "./state";

export function CPU({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "absolute h-[500px] w-[650px] rounded-lg border border-stone-600 bg-stone-900",
        className,
      )}
    >
      <span className="block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-lime-700 px-2 py-1 text-3xl font-bold text-white">
        CPU
      </span>

      <InternalBus />

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
  emphasis = false,
  className,
}: {
  name: PhysicalRegister | "MAR" | "MBR";
  emphasis?: boolean;
  className?: string;
}) {
  const cycle = useAtomValue(cycleAtom);
  const reg = useAtomValue(registerAtoms[name]);
  const low = reg.low;
  const high = reg.is16bits() ? reg.high : null;

  const style = useSpring({
    ref: animationRefs.cpu[name],
    from: { backgroundColor: colors.stone[800] },
  });

  // This fade is here instead of, for example, <CPU /> because updating the <CPU /> component
  // causes the whole tree to re-render, which causes the animation to reset.
  const fade =
    (name === "id" || name === "ri") && "metadata" in cycle && !cycle.metadata.willUse[name];

  return (
    <animated.div
      className={clsx(
        "absolute flex w-min items-center rounded-md border bg-stone-800 px-2 py-1 font-mono leading-none transition-opacity",
        emphasis ? "border-lime-500 text-lg" : "border-stone-600 text-base",
        fade && "opacity-40",
        className,
      )}
      style={style}
    >
      <span className="mr-2 font-bold">{name}</span>
      {high && (
        <span className="mr-0.5 rounded bg-stone-900 p-0.5 font-light">{high.toString("hex")}</span>
      )}
      <span className="rounded bg-stone-900 p-0.5 font-light">{low.toString("hex")}</span>
    </animated.div>
  );
}
