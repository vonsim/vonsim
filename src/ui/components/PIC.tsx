import { shallow } from "zustand/shallow";

import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { Card } from "./Card";

export function PIC() {
  const pic = useSimulator(state => state.devices.pic, shallow);

  return (
    <Card title="PIC">
      <table>
        <thead>
          <tr className="divide-x border-b">
            <th className="px-2 text-center font-bold text-slate-800">EOI</th>
            <th className="px-2 text-center font-bold text-slate-800">IMR</th>
            <th className="px-2 text-center font-bold text-slate-800">IRR</th>
            <th className="px-2 text-center font-bold text-slate-800">ISR</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr className="divide-x">
            <td className="px-2 text-center font-mono text-slate-600">
              {renderMemoryCell(pic.EOI, "bin")}
            </td>
            <td className="px-2 text-center font-mono text-slate-600">
              {renderMemoryCell(pic.IMR, "bin")}
            </td>
            <td className="px-2 text-center font-mono text-slate-600">
              {renderMemoryCell(pic.IRR, "bin")}
            </td>
            <td className="px-2 text-center font-mono text-slate-600">
              {renderMemoryCell(pic.ISR, "bin")}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
