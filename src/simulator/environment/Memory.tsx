import { Fragment, useCallback, useMemo, useState } from "react";
import create from "zustand";
import { MAX_MEMORY_ADDRESS, MEMORY_SIZE } from "~/config";

type MemoryState = {
  memory: number[];
};

export const useMemoryStore = create<MemoryState>()((set, get) => ({
  memory: new Array(MEMORY_SIZE).fill(0).map(() => Math.round(Math.random() * 255)),
}));

export function Memory() {
  const memory = useMemoryStore(store => store.memory);

  const [mode, setMode] = useState<"uint" | "int" | "bin" | "hex" | "ascii">("hex");
  const [start, setStart] = useState(0);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.currentTarget.valueAsNumber;
    if (!Number.isInteger(start)) return;
    if (start < 0) return;

    if (start <= MAX_MEMORY_ADDRESS - 64) {
      // It should be something like 0x1000 or 0x1008
      setStart(start - (start % 4));
    }

    if (start <= MAX_MEMORY_ADDRESS) {
      setStart(MAX_MEMORY_ADDRESS - 64);
    }
  };

  const parseValue = useCallback(
    (value: number) => {
      if (mode === "int") {
        return value < 128 ? value : value - 256;
      } else if (mode === "hex") {
        return value.toString(16).padStart(2, "0").toUpperCase();
      } else if (mode === "bin") {
        return value.toString(2).padStart(8, "0");
      } else if (mode === "ascii") {
        return String.fromCharCode(value);
      } else {
        return value;
      }
    },
    [mode],
  );

  const rows = useMemo(() => {
    const rows: { start: number; cols: number[] }[] = [];
    for (let i = 0; i < 16; i++) {
      const rowStart = start + i * 4;
      const cols = memory.slice(rowStart, rowStart + 4);
      rows.push({ start: rowStart, cols });
    }
    return rows;
  }, [start, mode]);

  return (
    <div className="rounded-lg bg-white p-2">
      <p className="font-extrabold uppercase tracking-wider text-gray-600">Memoria</p>

      <div>
        <button onClick={() => setMode("hex")}>Hex</button>
        <button onClick={() => setMode("bin")}>Bin</button>
        <button onClick={() => setMode("uint")}>BSS</button>
        <button onClick={() => setMode("int")}>Ca2</button>
        <button onClick={() => setMode("ascii")}>ASCII</button>
      </div>

      <div className="grid grid-cols-5 items-center gap-y-1 font-mono">
        {rows.map(({ start, cols }) => (
          <Fragment key={start}>
            <div className="text-center text-gray-600">
              {start.toString(16).padStart(4, "0").toUpperCase()}h
            </div>
            {cols.map((col, i) => (
              <div key={i} className="text-center text-gray-600">
                {parseValue(col)}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
