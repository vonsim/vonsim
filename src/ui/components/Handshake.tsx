import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { Card } from "./Card";

export function Handshake({ className }: { className?: string }) {
  const handshake = useSimulator(state => state.devices.handshake);

  return (
    <Card title="Handshake" className={className}>
      <table>
        <thead>
          <tr className="divide-x border-b">
            <th className="px-2 text-center font-bold text-slate-800">Dato</th>
            <th className="px-2 text-center font-bold text-slate-800">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr className="divide-x">
            <td className="px-2 text-center font-mono text-slate-600" title="Registo Dato (40h)">
              {renderMemoryCell(handshake.data, "ascii")}
            </td>
            <td className="px-2 text-center font-mono text-slate-600" title="Registo Estado (41h)">
              {renderMemoryCell(handshake.state, "bin")}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
