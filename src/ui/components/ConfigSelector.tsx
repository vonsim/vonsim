import { RadioGroup } from "@headlessui/react";
import { useMemo } from "react";

import { useTranslate } from "@/ui/hooks/useTranslate";
import { useRunner } from "@/ui/lib/runner";
import { useSettings } from "@/ui/lib/settings";
import { cn } from "@/ui/lib/utils";

export function ConfigSelector() {
  const tranlate = useTranslate();
  const settings = useSettings();

  const stopped = useRunner(runner => runner.state.type === "stopped");

  return (
    <div className="flex w-min flex-col flex-wrap gap-y-2 gap-x-4 sm:max-h-32">
      <Radio
        label={tranlate("settings.devicesConfiguration.label")}
        value={settings.devicesConfiguration}
        onChange={settings.setDevicesConfiguration}
        options={{
          "switches-leds": tranlate("settings.devicesConfiguration.switches-leds"),
          "printer-pio": tranlate("settings.devicesConfiguration.printer-pio"),
          "printer-handshake": tranlate("settings.devicesConfiguration.printer-handshake"),
        }}
        disabled={!stopped}
        flow="column"
      />

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
    </div>
  );
}

function Radio<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled = false,
  flow = "row",
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { [key in T]: string };
  disabled?: boolean;
  flow?: "row" | "column";
}) {
  const entries = useMemo(() => Object.entries(options) as [T, string][], [options]);

  return (
    <RadioGroup value={value} onChange={onChange} className="w-min" disabled={disabled}>
      <RadioGroup.Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </RadioGroup.Label>
      <div
        className={cn(
          "flex overflow-hidden rounded-md bg-white text-sm font-medium tracking-wide",
          flow === "row" ? "flex-row divide-x" : "flex-col divide-y",
        )}
      >
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
