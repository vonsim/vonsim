import { useId, useMemo, useState } from "react";
import { useMeasure } from "react-use";
import { toast } from "sonner";

import { MEMORY_SIZE, MIN_MEMORY_ADDRESS } from "@/config";
import { renderAddress } from "@/helpers";
import { Card } from "@/ui/components/common/Card";
import { CellView } from "@/ui/components/common/CellView";
import { Table } from "@/ui/components/common/Table";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { cn } from "@/ui/lib/utils";

export function Memory({ className }: { className?: string }) {
  const translate = useTranslate();

  const startId = useId();
  const [start, setStart] = useState(0x1000);
  const [startInput, setStartInput] = useState("");

  const [ref, { width }] = useMeasure<HTMLHRElement>();

  // Calculate the grid size based on the width of the card
  const { cols, rows, cells, offset } = useMemo(() => {
    const charWidth = 9.86; // Fira Code is 9.86px wide at 16px (1rem)

    const cols = Math.floor(width / (charWidth * 10)) || 1;
    const rows = cols <= 4 ? 12 : 6;

    const cells = cols * rows;
    const offset = MEMORY_SIZE - cells < start ? MEMORY_SIZE - cells : start;
    return { cols, cells, rows, offset };
  }, [start, width]);

  const memory = useSimulator(s => s.simulator.memory.slice(offset, offset + cells));

  return (
    <Card title={translate("cpu.memory.name")} className={className}>
      <div className="px-4 py-2">
        <label
          htmlFor={startId}
          className="text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          {translate("cpu.memory.start-address")}
        </label>
        <div className="relative w-20 font-mono">
          <input
            id={startId}
            placeholder={renderAddress(start, { trailingH: false })}
            className="w-full border-b border-sky-400 pl-2 pr-5 text-right outline-sky-400"
            maxLength={4}
            value={startInput}
            onChange={e => setStartInput(e.currentTarget.value)}
            onBlur={() => setStartInput("")}
            onKeyDown={e => {
              if (e.key === "Enter") {
                const address = parseInt(startInput, 16);
                if (!Number.isInteger(address) || address < MIN_MEMORY_ADDRESS) {
                  toast.error(translate("cpu.memory.start-address-must-be-integer"));
                  return;
                }
                if (address > MEMORY_SIZE) {
                  toast.error(translate("cpu.memory.start-address-too-big"));
                  return;
                }
                setStart(address);
              }
            }}
          />
          <div className="pointer-events-none absolute bottom-0 right-2 top-0">
            <span>h</span>
          </div>
        </div>
      </div>

      <hr ref={ref} />

      <Table className="w-full">
        <Table.Head>
          {Array.from({ length: cols }).map((_, i) => (
            <Table.ColLabel key={i} className={cn(i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
              {renderAddress(offset + i * rows)}
            </Table.ColLabel>
          ))}
        </Table.Head>
        <Table.Body divide={false}>
          {Array.from({ length: rows }).map((_, i) => (
            <Table.Row key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <Table.Cell
                  key={j}
                  className={cn("w-byte p-0", j % 2 === 0 ? "bg-white" : "bg-slate-50")}
                >
                  <CellView
                    name={translate("cpu.memory.cell", offset + i + j * rows)}
                    value={memory[i + j * rows]}
                  />
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
}