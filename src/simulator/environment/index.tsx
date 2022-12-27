import { Memory } from "./Memory";

export function Environment() {
  return (
    <div className="grid grow grid-cols-3 overflow-auto bg-gray-200 p-8">
      <Memory />

      <p className="">connect</p>

      <div className="rounded-lg bg-white p-2">
        <p className="font-extrabold uppercase tracking-wider text-gray-600">CPU</p>
      </div>

      <p>connect</p>

      <div className="col-span-2" />

      <div className="col-span-3 rounded-lg bg-white p-2">
        <p className="font-extrabold uppercase tracking-wider text-gray-600">Dispositivos</p>
      </div>
    </div>
  );
}
