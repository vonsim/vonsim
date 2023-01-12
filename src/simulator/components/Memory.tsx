import { useId, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useMeasure } from "react-use";
import { shallow } from "zustand/shallow";

import { MAX_MEMORY_ADDRESS, MEMORY_SIZE, MIN_MEMORY_ADDRESS } from "~/config";
import { useComputer } from "../computer";
import { renderAddress, renderMemoryCell } from "../helpers";
import { Card } from "./Card";

export function Memory() {
  const memoryRepresentation = useComputer(state => state.memoryRepresentation);

  const startId = useId();
  const [start, setStart] = useState(0x1000);
  const [startInput, setStartInput] = useState("");

  const [ref, { width }] = useMeasure<HTMLTableElement>();

  // Calculate the grid size based on the width of the card
  const { cols, rows, cells, offset } = useMemo(() => {
    if (window.devicePixelRatio === 0) return { cols: 0, rows: 0, cells: 0, offset: start };
    const charWidth = 10 * window.devicePixelRatio; // Jetbrains Mono is 10px wide at 100% zoom and 16px (1rem)

    const cols = Math.floor(width / (charWidth * 10)) || 1;
    const rows = cols <= 4 ? 12 : 6;

    const cells = cols * rows;
    const offset = MAX_MEMORY_ADDRESS - cells < start ? MAX_MEMORY_ADDRESS - cells : start;
    return { cols, cells, rows, offset };
  }, [start, width, window.devicePixelRatio]);

  const memory = useComputer(
    state => [...new Uint8Array(state.memory).slice(offset, offset + cells)],
    shallow,
  );

  return (
    <Card title="Memoria">
      <label
        htmlFor={startId}
        className="text-xs font-bold uppercase tracking-wider text-slate-700"
      >
        Dirección de inicio
      </label>
      <div className="relative w-20 font-mono">
        <input
          id={startId}
          placeholder={renderAddress(start, false)}
          className="w-full border-b border-sky-400 pl-2 pr-5 text-right outline-sky-400"
          maxLength={4}
          value={startInput}
          onChange={e => setStartInput(e.currentTarget.value)}
          onBlur={() => setStartInput("")}
          onKeyDown={e => {
            if (e.key === "Enter") {
              const address = parseInt(startInput, 16);
              if (!Number.isInteger(address) || address < MIN_MEMORY_ADDRESS) {
                toast.error("El valor de inicio debe ser un número entero");
                return;
              }
              if (address > MEMORY_SIZE) {
                toast.error(
                  `El valor de inicio debe ser menor o igual a ${renderAddress(MEMORY_SIZE)}`,
                );
                return;
              }
              setStart(address);
            }
          }}
        />
        <div className="pointer-events-none absolute right-2 top-0 bottom-0">
          <span>h</span>
        </div>
      </div>

      <table className="mt-4 w-full font-mono" ref={ref}>
        <thead>
          <tr className="divide-x border-b">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="text-center font-bold text-slate-800">
                {renderAddress(offset + i * rows)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="divide-x">
              {Array.from({ length: cols }).map((_, j) => (
                <td
                  key={j}
                  title={renderAddress(offset + i + j * rows)}
                  className="w-[7ch] text-center text-slate-600"
                >
                  {renderMemoryCell(memory[i + j * rows], memoryRepresentation)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
