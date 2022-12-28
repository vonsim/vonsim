import { RadioGroup } from "@headlessui/react";
import { useConfig } from "./config";
import { CPU } from "./CPU";
import { Memory } from "./Memory";

export function Environment() {
  const config = useConfig();

  return (
    <div className="grid grow grid-cols-2 gap-16 overflow-auto bg-gray-200 p-8">
      <div className="col-span-2 border-b border-slate-500/30">
        <RadioGroup
          value={config.memoryRepresentation}
          onChange={config.setMemoryRepresentation}
          className="w-min"
        >
          <RadioGroup.Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Modo de representación
          </RadioGroup.Label>
          <div className="flex divide-x overflow-hidden rounded-md bg-white text-sm font-medium tracking-wide">
            <RepresentationModeCell value="hex" label="Hex" />
            <RepresentationModeCell value="bin" label="Bin" />
            <RepresentationModeCell value="uint" label="BSS" />
            <RepresentationModeCell value="int" label="Ca2" />
            <RepresentationModeCell value="ascii" label="Ascii" />
          </div>
        </RadioGroup>
      </div>

      <Memory />

      <CPU />

      <div className="col-span-2 rounded-lg bg-white p-2">
        <p className="font-extrabold uppercase tracking-wider text-gray-600">Dispositivos</p>
      </div>
    </div>
  );
}

function RepresentationModeCell({ value, label }: { value: string; label: string }) {
  return (
    <RadioGroup.Option
      value={value}
      className="cursor-pointer select-none px-2 py-1 ui-checked:bg-sky-400 ui-checked:text-white"
    >
      {label}
    </RadioGroup.Option>
  );
}
