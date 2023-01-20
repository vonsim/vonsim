import { RadioGroup } from "@headlessui/react";
import { useMemo } from "react";

import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { useSettings } from "../settings";

export function ConfigSelector() {
  const settings = useSettings();
  const runner = useSimulator(state => state.runner);
  const tranlate = useTranslate();

  return (
    <div className="flex flex-wrap gap-y-2 gap-x-4">
      <Radio
        label={tranlate("settings.memoryRepresentation.label")}
        value={settings.memoryRepresentation}
        onChange={settings.setMemoryRepresentation}
        options={{
          hex: tranlate("settings.memoryRepresentation.hex"),
          bin: tranlate("settings.memoryRepresentation.bin"),
          uint: tranlate("settings.memoryRepresentation.uint"),
          int: tranlate("settings.memoryRepresentation.int"),
          ascii: tranlate("settings.memoryRepresentation.ascii"),
        }}
      />

      <Radio
        label={tranlate("settings.memoryOnReset.label")}
        value={settings.memoryOnReset}
        onChange={settings.setMemoryOnReset}
        options={{
          random: tranlate("settings.memoryOnReset.random"),
          empty: tranlate("settings.memoryOnReset.empty"),
          keep: tranlate("settings.memoryOnReset.keep"),
        }}
      />

      <Radio
        label={tranlate("settings.devicesConfiguration.label")}
        value={settings.devicesConfiguration}
        onChange={settings.setDevicesConfiguration}
        options={{
          "switches-leds": tranlate("settings.devicesConfiguration.switches-leds"),
          "printer-pio": tranlate("settings.devicesConfiguration.printer-pio"),
          "printer-handshake": tranlate("settings.devicesConfiguration.printer-handshake"),
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
