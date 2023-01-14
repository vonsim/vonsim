import { shallow } from "zustand/shallow";

import { renderMemoryCell } from "~/helpers";
import { useSimulator } from "~/simulator";
import { Card } from "./Card";

export function PIO() {
  const pio = useSimulator(state => state.devices.pio, shallow);

  return (
    <Card title="PIO">
      <table>
        <thead>
          <tr className="divide-x border-b">
            <th></th>
            <th className="px-2 text-center font-bold text-slate-800">Datos</th>
            <th className="px-2 text-center font-bold text-slate-800">Configuración</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr className="divide-x">
            <td className="px-2 text-center font-bold text-slate-800">Puerto A</td>
            <td className="px-2 text-center font-mono text-slate-600" title="Registo PA (30h)">
              {renderMemoryCell(pio.PA, "bin")}
            </td>
            <td className="px-2 text-center font-mono text-slate-600" title="Registo CA (32h)">
              {renderMemoryCell(pio.CA, "bin")}
            </td>
          </tr>
          <tr className="divide-x">
            <td className="px-2 text-center font-bold text-slate-800">Puerto B</td>
            <td className="px-2 text-center font-mono text-slate-600" title="Registo PB (31h)">
              {renderMemoryCell(pio.PB, "bin")}
            </td>
            <td className="px-2 text-center font-mono text-slate-600" title="Registo CB (33h)">
              {renderMemoryCell(pio.CB, "bin")}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
