import { Listbox } from "@headlessui/react";
import { useMemo } from "react";

import { useSimulator } from "@/simulator";

export function FrecuencyPicker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [value: string, label: string][];
}) {
  const runner = useSimulator(state => state.runner);

  const current = useMemo(
    () => options.find(([v]) => v === value)?.[1] ?? "Ninguna",
    [value, options],
  );

  return (
    <Listbox value={value} onChange={onChange} disabled={runner !== "stopped"}>
      <Listbox.Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
        Frecuencia
      </Listbox.Label>
      <div className="relative">
        <Listbox.Button
          className="
            rounded-lg border border-sky-400 px-2 py-1 text-sm transition
            focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 
            active:hover:bg-sky-400 active:hover:text-white
          "
        >
          {current}
        </Listbox.Button>
        <Listbox.Options
          className="
            absolute left-0 mt-1 max-h-60 w-min overflow-auto rounded-md bg-white text-sm shadow-lg
            focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/25
          "
        >
          {options.map(([value, label], i) => (
            <Listbox.Option
              key={i}
              className="
                cursor-pointer select-none whitespace-nowrap py-1 px-2 text-left text-gray-900
                ui-selected:font-semibold ui-active:bg-sky-100 ui-active:text-sky-900
              "
              value={value}
            >
              {label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}
