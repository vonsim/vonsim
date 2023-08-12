import clsx from "clsx";
import { useAtomValue } from "jotai";

import { animated, getSpring, RegisterKey } from "@/computer/shared/springs";
import type { AnyByteAtom } from "@/computer/shared/types";

export function Register({
  name,
  valueAtom,
  springs,
  emphasis = false,
  title,
  className,
}: {
  name: string;
  valueAtom: AnyByteAtom;
  springs: RegisterKey;
  emphasis?: boolean;
  title?: string;
  className?: string;
}) {
  const reg = useAtomValue(valueAtom);
  const low = reg.low;
  const high = reg.is16bits() ? reg.high : null;

  return (
    <animated.div
      title={title}
      className={clsx(
        "flex w-min items-center rounded-md border bg-stone-800 px-2 py-1 font-mono leading-none transition-opacity",
        emphasis ? "border-mantis-400 text-lg" : "border-stone-600 text-base",
        className,
      )}
      style={getSpring(springs)}
    >
      <span className="mr-2 font-bold">{name}</span>
      {high && (
        <span className="mr-0.5 rounded bg-stone-900 p-0.5 font-light">{high.toString("hex")}</span>
      )}
      <span className="rounded bg-stone-900 p-0.5 font-light">{low.toString("hex")}</span>
    </animated.div>
  );
}
