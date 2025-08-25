import clsx from "clsx";
import { useAtomValue } from "jotai";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { animated, getSpring, RegisterKey } from "@/computer/shared/springs";
import type { AnyByteAtom } from "@/computer/shared/types";
import { useTranslate } from "@/lib/i18n";

export function Register({
  name,
  title,
  valueAtom,
  springs,
  emphasis = false,
  className,
}: {
  name: string;
  title: string;
  valueAtom: AnyByteAtom;
  springs: RegisterKey;
  emphasis?: boolean;
  className?: string;
}) {
  const translate = useTranslate();

  const reg = useAtomValue(valueAtom);
  const low = reg.low;
  const high = reg.is16bits() ? reg.high : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <animated.button
          title={title}
          className={clsx(
            "bg-background-1 flex w-min cursor-pointer items-center rounded-md border px-2 py-1 font-mono leading-none transition-opacity",
            emphasis ? "border-primary-1 text-lg" : "border-border text-base",
            className,
          )}
          style={getSpring(springs)}
        >
          <span className="mr-2 font-bold">{name}</span>
          {high && (
            <span className="bg-background-0 mr-0.5 rounded-sm p-0.5 font-light">
              {high.toString("hex")}
            </span>
          )}
          <span className="bg-background-0 rounded-sm p-0.5 font-light">{low.toString("hex")}</span>
        </animated.button>
      </PopoverTrigger>

      <PopoverContent className="w-60">
        <p className="text-foreground px-4 py-2 font-medium">{title}</p>
        <hr className="border-border" />
        <ul className="px-4 py-2 text-sm">
          {(["hex", "bin", "uint", "int", "safe-ascii"] as const).map(rep => (
            <li key={rep}>
              <b className="font-medium">{translate(`generics.byte-representation.${rep}`)}</b>:{" "}
              <span className="text-primary-1 font-mono">{reg.toString(rep)}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
