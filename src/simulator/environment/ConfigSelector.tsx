import { RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { useMemo } from "react";
import { toast } from "react-hot-toast";
import { useLongPress } from "react-use";
import shallow from "zustand/shallow";
import { useComputer } from "../computer";

const speeds = new Array(7).fill(null).map((_, i) => 2 ** i); // From 1 Hz to 64 Hz
const speedOptions = Object.fromEntries(speeds.map(speed => [speed.toString(), `${speed} Hz`]));

export function ConfigSelector({ className }: { className?: string }) {
  const config = useComputer(
    state => ({
      memoryRepresentation: state.memoryRepresentation,
      setMemoryRepresentation: state.setMemoryRepresentation,
      memoryOnReset: state.memoryOnReset,
      setMemoryOnReset: state.setMemoryOnReset,
      clockSpeed: state.clockSpeed,
      setClockSpeed: state.setClockSpeed,
    }),
    shallow,
  );

  const longPressClockSpeed = useLongPress(
    () => {
      toast("Se activó el modo 8088.\nLa frecuencia de reloj se estableció en 5 MHz.", {
        icon: "👾",
      });
      config.setClockSpeed(5_000_000);
    },
    { delay: 1500 },
  );

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

      <div {...longPressClockSpeed}>
        <Radio
          label="Frecuencia de reloj"
          value={config.clockSpeed.toString()}
          onChange={n => config.setClockSpeed(parseInt(n, 10))}
          options={speedOptions}
        />
      </div>
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
            className="cursor-pointer select-none whitespace-nowrap px-2 py-1 ui-checked:bg-sky-400 ui-checked:text-white"
          >
            {label}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
