import { shallow } from "zustand/shallow";

import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { Card } from "./Card";

export function Timer({ className }: { className?: string }) {
  const { CONT, COMP, memoryRepresentation } = useSimulator(
    state => ({
      CONT: state.devices.timer.CONT,
      COMP: state.devices.timer.COMP,
      memoryRepresentation: state.memoryRepresentation,
    }),
    shallow,
  );

  return (
    <Card title="Timer" className={className}>
      <table>
        <thead>
          <tr className="divide-x border-b">
            <th className="px-2 text-center font-bold text-slate-800" title="Registo CONT (10h)">
              CONT
            </th>
            <th className="px-2 text-center font-bold text-slate-800" title="Registo COMP (11h)">
              COMP
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="divide-x">
            <td className="px-2 text-center font-mono text-slate-600" title="Registo CONT (10h)">
              {renderMemoryCell(CONT, memoryRepresentation)}
            </td>
            <td className="px-2 text-center font-mono text-slate-600" title="Registo COMP (11h)">
              {renderMemoryCell(COMP, memoryRepresentation)}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
