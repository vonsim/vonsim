import { RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { useMemo } from "react";
import { useConfig } from ".";

export function ConfigSelector({ className }: { className?: string }) {
  const config = useConfig();

  return (
    <div className={clsx("flex gap-x-4", className)}>
      <Radio
        label="Modo de representación"
        value={config.memoryRepresentation}
        onChange={config.setMemoryRepresentation}
        options={{
          hex: "Hex",
          bin: "Bin",
          uint: "BSS",
          int: "Ca2",
          ascii: "Ascii",
        }}
      />

      <Radio
        label="Memoria al compilar"
        value={config.memoryOnReset}
        onChange={config.setMemoryOnReset}
        options={{
          random: "Aleatoria",
          empty: "Vaciar",
          keep: "Mantener",
        }}
      />
    </div>
  );
}

function Radio<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { [key in T]: string };
}) {
  const entries = useMemo(() => Object.entries(options) as [T, string][], [options]);

  return (
    <RadioGroup value={value} onChange={onChange} className="w-min">
      <RadioGroup.Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </RadioGroup.Label>
      <div className="flex divide-x overflow-hidden rounded-md bg-white text-sm font-medium tracking-wide">
        {entries.map(([value, label], i) => (
          <RadioGroup.Option
            key={i}
            value={value}
            className="cursor-pointer select-none px-2 py-1 ui-checked:bg-sky-400 ui-checked:text-white"
          >
            {label}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
