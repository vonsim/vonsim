import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import type { Byte } from "@vonsim/common/byte";
import { Fragment } from "react";

import { useDataRepresentation } from "@/hooks/useSettings";
import { useTranslate } from "@/hooks/useTranslate";
import { cn } from "@/lib/utils";

export function CellView({
  name,
  value,
  className,
}: {
  name: string;
  value: Byte<8>;
  className?: string;
}) {
  const translate = useTranslate();
  const dataRepresentation = useDataRepresentation();

  return (
    <Popover as={Fragment}>
      <Float placement="bottom" shift>
        <Popover.Button
          className={cn(
            "w-full px-2 py-0.5 font-mono outline-none transition-colors hover:bg-accent/20 focus:bg-accent/75 focus:text-white",
            className,
          )}
        >
          {value.toString(dataRepresentation)}
        </Popover.Button>

        <Popover.Panel className="z-50 w-60 rounded-md border border-slate-300 bg-white text-left font-sans shadow-md outline-none">
          <p className="px-4 py-2 font-medium text-slate-800">{name}</p>
          <hr />
          <ul className="px-4 py-2 text-sm">
            {(["hex", "bin", "uint", "int", "ascii"] as const).map(rep => (
              <li key={rep}>
                <b className="font-semibold">{translate(`menu.dataRepresentation.${rep}`)}</b>:{" "}
                <span className="font-mono">{value.toString(rep)}</span>
              </li>
            ))}
          </ul>
        </Popover.Panel>
      </Float>
    </Popover>
  );
}
