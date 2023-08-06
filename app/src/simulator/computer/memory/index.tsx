import clsx from "clsx";
import { useAtomValue } from "jotai";

import { memoryShownAtom } from "./state";

export function Memory({ className }: { className?: string }) {
  const memory = useAtomValue(memoryShownAtom);

  return (
    <div
      className={clsx(
        "absolute h-[400px] w-[150px] rounded-lg border border-stone-600 bg-stone-900",
        className,
      )}
    >
      <span className="block w-min rounded-br-lg rounded-tl-lg border-b border-r border-stone-600 bg-mantis-500 px-2 py-1 text-3xl font-bold text-white">
        Memory
      </span>

      <div className="m-4 w-min overflow-hidden rounded-lg border border-stone-600">
        <table className="font-mono text-lg">
          <tbody>
            {memory.map((row, i) => (
              <tr
                key={i}
                className="border-b border-stone-600 odd:bg-stone-900 even:bg-stone-800 last-of-type:border-b-0"
              >
                <td className="border-r border-stone-600 px-2 py-1 font-thin">
                  {row.address.toString()}
                </td>
                <td className="px-2 py-1">{row.value.toString("hex")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}