import { RadioGroup } from "@headlessui/react";
import { useMemo } from "react";

import { useSimulator } from "@/simulator";

import { useSettings } from "../settings";

export function ConfigSelector() {
  const settings = useSettings();
  const runner = useSimulator(state => state.runner);

  return (
    <div className="flex flex-wrap gap-y-2 gap-x-4">
      <Radio
        label="Modo de representación"
        value={settings.memoryRepresentation}
        onChange={settings.setMemoryRepresentation}
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
        value={settings.memoryOnReset}
        onChange={settings.setMemoryOnReset}
        options={{
          random: "Aleatoria",
          empty: "Vaciar",
          keep: "Mantener",
        }}
      />

      <Radio
        label="Dispositivos"
        value={settings.devicesConfiguration}
        onChange={settings.setDevicesConfiguration}
        options={{
          "switches-leds": "Teclas y leds",
          "printer-pio": "Impresora con PIO",
          "printer-handshake": "Impresora con Handshake",
        }}
        disabled={runner !== "stopped"}
      />
    </div>
  );
}

function Radio<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { [key in T]: string };
  disabled?: boolean;
}) {
  const entries = useMemo(() => Object.entries(options) as [T, string][], [options]);

  return (
    <RadioGroup value={value} onChange={onChange} className="w-min" disabled={disabled}>
      <RadioGroup.Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </RadioGroup.Label>
      <div className="flex divide-x overflow-hidden rounded-md bg-white text-sm font-medium tracking-wide">
        {entries.map(([value, label], i) => (
          <RadioGroup.Option
            key={i}
            value={value}
            className="cursor-pointer select-none whitespace-nowrap px-2 py-1 ui-checked:bg-sky-400 ui-checked:text-white ui-disabled:cursor-default ui-disabled:opacity-50"
          >
            {label}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
