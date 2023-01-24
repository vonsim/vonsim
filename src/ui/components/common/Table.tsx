import clsx from "clsx";
import { useMemo } from "react";

import { renderMemoryCell } from "@/helpers";
import { useSettings } from "@/ui/lib/settings";

export function Table({
  columns,
  rows,
  divideRows = true,
  labelsSans = false,
  className,
}: {
  columns?: readonly string[];
  rows: readonly {
    label?: string;
    cells: (
      | { content: string; title?: string; renderMemory?: false }
      | { content: number; title?: string; renderMemory: true }
    )[];
  }[];
  divideRows?: boolean;
  labelsSans?: boolean;
  className?: string;
}) {
  const memoryRepresentation = useSettings(state => state.memoryRepresentation);

  const thereAreRowLabels = useMemo(
    () => rows.find(row => typeof row.label === "string") !== undefined,
    [rows],
  );

  return (
    <table className={clsx("font-mono", className)}>
      <thead>
        {columns && (
          <tr className="divide-x border-b">
            {thereAreRowLabels && <th />}
            {columns.map((col, i) => (
              <th
                key={i}
                className={clsx(
                  "px-2 pb-0.5 pt-1 text-center font-bold text-slate-800",
                  labelsSans && "font-sans",
                )}
              >
                {col}
              </th>
            ))}
          </tr>
        )}
      </thead>
      <tbody className={divideRows ? "divide-y" : ""}>
        {rows.map(({ label, cells }, i) => (
          <tr key={i} className="divide-x">
            {thereAreRowLabels && (
              <td
                className={clsx(
                  "px-2 pb-0.5 text-center font-bold text-slate-800",
                  !columns && i === 0 ? "pt-1" : "pt-0.5",
                  labelsSans && "font-sans",
                )}
              >
                {label || "-"}
              </td>
            )}
            {cells.map((cell, j) => {
              const content = cell.renderMemory
                ? renderMemoryCell(cell.content, memoryRepresentation)
                : cell.content;

              return (
                <td
                  key={j}
                  className={clsx(
                    "box-content px-2 pb-0.5 text-center text-slate-600",
                    !columns && i === 0 ? "pt-1" : "pt-0.5",
                    cell.renderMemory && "w-[8ch]",
                  )}
                  title={cell.title}
                >
                  {content}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
