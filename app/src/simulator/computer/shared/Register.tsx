import { animated, SpringRef, useSpring } from "@react-spring/web";
import clsx from "clsx";
import { useAtomValue } from "jotai";

import { colors } from "@/lib/tailwind";
import type { AnyByteAtom } from "@/simulator/computer/shared/types";

export type RegisterRef = { backgroundColor: string; opacity: number };

export function Register({
  name,
  valueAtom,
  emphasis = false,
  className,
  springRef,
}: {
  name: string;
  valueAtom: AnyByteAtom;
  springRef: SpringRef<RegisterRef>;
  emphasis?: boolean;
  className?: string;
}) {
  const reg = useAtomValue(valueAtom);
  const low = reg.low;
  const high = reg.is16bits() ? reg.high : null;

  const style = useSpring({
    ref: springRef,
    from: { backgroundColor: colors.stone[800], opacity: 1 },
  });

  return (
    <animated.div
      className={clsx(
        "flex w-min items-center rounded-md border bg-stone-800 px-2 py-1 font-mono leading-none transition-opacity",
        emphasis ? "border-mantis-400 text-lg" : "border-stone-600 text-base",
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
