import clsx from "clsx";

import { useTranslate } from "@/hooks/useTranslate";

export function ChipSelect({ className }: { className?: string }) {
  const translate = useTranslate();

  return (
    <div
      className={clsx(
        "absolute z-10 h-[70px] w-[250px] rounded-lg border border-stone-600 bg-stone-900",
        className,
      )}
    >
      <span className="block w-min whitespace-nowrap rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-lg font-bold text-white">
        {translate("computer.chip-select.name")}
      </span>
    </div>
  );
}
