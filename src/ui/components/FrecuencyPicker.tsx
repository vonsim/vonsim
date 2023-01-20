import { Listbox } from "@headlessui/react";

import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";

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

  const runner = useSimulator(state => state.runner);

  return (
    <Listbox value={value} onChange={onChange} disabled={runner !== "stopped"}>
      <div className={className}>
        <Listbox.Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {translate("frecuency")}
        </Listbox.Label>
        <div className="relative">
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
            absolute left-0 mt-1 max-h-60 w-min overflow-auto rounded-md bg-white text-sm shadow-lg
            focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/25
          "
          >
            {options.map((value, i) => (
              <Listbox.Option
                key={i}
                className="
                cursor-pointer select-none whitespace-nowrap py-1 px-2 text-left text-gray-900
                ui-selected:font-semibold ui-active:bg-sky-100 ui-active:text-sky-900
              "
                value={value}
              >
                {translate("hertz", value)}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </div>
    </Listbox>
  );
}
