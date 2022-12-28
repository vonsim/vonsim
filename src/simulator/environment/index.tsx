import { ConfigSelector } from "./config/ConfigSelector";
import { CPU } from "./CPU";
import { Memory } from "./Memory";

export function Environment() {
  return (
    <div className="grid grow grid-cols-2 gap-16 overflow-auto bg-gray-200 p-8">
      <ConfigSelector className="col-span-2 border-b border-slate-500/30" />

      <Memory />

      <CPU />

      <div className="col-span-2 rounded-lg bg-white p-2">
        <p className="font-extrabold uppercase tracking-wider text-gray-600">Dispositivos</p>
      </div>
    </div>
  );
}
