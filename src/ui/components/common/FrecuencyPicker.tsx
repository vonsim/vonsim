import { Listbox } from "@headlessui/react";
import { Float } from "@headlessui-float/react";

import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";

export function FrecuencyPicker({
  value,
  onChange,
  options,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  options: number[];
  className?: string;
}) {
  const translate = useTranslate();

  const stopped = useSimulator(s => s.state.type === "stopped");

  return (
    <Listbox value={value} onChange={onChange} disabled={!stopped}>
      <div className={className}>
        <Listbox.Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {translate("frecuency")}
        </Listbox.Label>
        <Float autoPlacement offset={4}>
          <Listbox.Button
            className="
              rounded-lg border border-sky-400 px-2 py-1 text-sm transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 
              active:hover:bg-sky-400 active:hover:text-white
            "
          >
            {translate("hertz", value)}
          </Listbox.Button>
          <Listbox.Options
            className="
              w-min rounded-md border border-slate-200 bg-white text-sm shadow-lg ring-1 ring-black ring-opacity-5
              focus:outline-none
            "
          >
            {options.map((value, i) => (
              <Listbox.Option
                key={i}
                className="
                  cursor-pointer select-none whitespace-nowrap py-2 px-4 text-left text-gray-900
                  ui-selected:font-semibold ui-active:bg-sky-100 ui-active:text-sky-900
                "
                value={value}
              >
                {translate("hertz", value)}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Float>
      </div>
    </Listbox>
  );
}
