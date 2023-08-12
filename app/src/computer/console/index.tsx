import clsx from "clsx";

import { useTranslate } from "@/hooks/useTranslate";

import { Keyboard } from "./Keyboard";
import { Monitor } from "./Monitor";

export function Console({ className }: { className?: string }) {
  const translate = useTranslate();

  return (
    <div
      className={clsx(
        "absolute z-10 h-min w-[500px] rounded-lg border border-stone-600 bg-stone-900 [&_*]:z-20",
        className,
      )}
    >
      <span className="block w-min whitespace-nowrap rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-xs font-semibold tracking-wide text-white">
        {translate("computer.console")}
      </span>
      <Monitor />

      <hr className="border-stone-600" />

      <Keyboard />
    </div>
  );
}
