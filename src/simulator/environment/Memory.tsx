import clsx from "clsx";
import { useCallback, useId, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import shallow from "zustand/shallow";

import { MEMORY_SIZE, MIN_MEMORY_ADDRESS } from "~/config";
import { useComputer } from "./computer";
import { useConfig } from "./config";
import { renderAddress, renderMemoryCell } from "./helpers";

export function Memory() {
  const startId = useId();
  const config = useConfig();

  const [start, setStart] = useState(0x1000);
  const [startValue, setStartValue] = useState("");

  const memory = useComputer(state => state.memory.slice(start, start + 64), shallow);

  const handleStartChange = useCallback(() => {
    const address = parseInt(startValue, 16);
    if (!Number.isInteger(address) || address < MIN_MEMORY_ADDRESS) {
      toast.error("El valor de inicio debe ser un número entero");
      return;
    }

    if (address < MEMORY_SIZE - 64) setStart(address);
    else if (address <= MEMORY_SIZE) setStart(MEMORY_SIZE - 64);
    else toast.error(`El valor de inicio debe ser menor o igual a ${renderAddress(MEMORY_SIZE)}`);
  }, [startValue]);

  const rows = useMemo(() => {
    const rows: { start: number; cols: number[] }[] = [];
    for (let i = 0; i < 16; i++) {
      const rowStart = i * 4;
      const cols = memory.slice(rowStart, rowStart + 4);
      rows.push({ start: start + rowStart, cols });
    }
    return rows;
  }, [start, memory]);

  return (
    <div className="rounded-lg bg-white px-4 py-2">
      <p className="font-extrabold uppercase tracking-wider text-gray-600">Memoria</p>

      <label
        htmlFor={startId}
        className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-700"
      >
        Inicio
      </label>
      <div className="relative w-20 font-mono">
        <input
          id={startId}
          placeholder={renderAddress(start, false)}
          className="w-full border-b border-sky-400 pl-2 pr-5 text-right outline-sky-400"
          maxLength={4}
          value={startValue}
          onChange={e => setStartValue(e.currentTarget.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              handleStartChange();
            }
          }}
        />
        <div className="pointer-events-none absolute right-2 top-0 bottom-0">
          <span>h</span>
        </div>
      </div>

      <table className="mt-4 border border-slate-200 font-mono">
        <tbody className="divide-y">
          {rows.map(({ start, cols }, i) => (
            <tr key={start} className={clsx("divide-x", i % 2 === 1 && "bg-slate-100")}>
              <td className="w-[7ch] text-center font-bold text-slate-800">
                {renderAddress(start)}
              </td>
              {cols.map((col, i) => (
                <td key={i} className="w-[10ch] text-center text-slate-600">
                  {renderMemoryCell(col, config.memoryRepresentation)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
