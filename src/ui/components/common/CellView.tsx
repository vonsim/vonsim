import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import { Fragment } from "react";

import { renderMemoryCell } from "@/helpers";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { useSettings } from "@/ui/lib/settings";
import { cn } from "@/ui/lib/utils";

export function CellView({
  name,
  value,
  className,
}: {
  name: string;
  value: number;
  className?: string;
}) {
  const translate = useTranslate();
  const memoryRepresentation = useSettings(state => state.memoryRepresentation);

  return (
    <Popover as={Fragment}>
      <Float placement="bottom" shift>
        <Popover.Button
          className={cn(
            "w-full px-2 py-0.5 outline-none transition-colors hover:bg-accent/30 focus:bg-accent/75 focus:text-white",
            className,
          )}
        >
          {renderMemoryCell(value, memoryRepresentation)}
        </Popover.Button>

        <Popover.Panel className="z-50 w-60 rounded-md border border-slate-300 bg-white text-left font-sans shadow-md outline-none">
          <p className="px-4 py-2 font-medium text-slate-800">{name}</p>
          <hr />
          <ul className="px-4 py-2 text-sm">
            {(["hex", "bin", "uint", "int", "ascii"] as const).map(rep => (
              <li key={rep}>
                <b className="font-semibold">{translate(`menu.memoryRepresentation.${rep}`)}</b>:{" "}
                <span className="font-mono">{renderMemoryCell(value, rep)}</span>
              </li>
            ))}
          </ul>
        </Popover.Panel>
      </Float>
    </Popover>
  );
}
