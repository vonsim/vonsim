import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { Card } from "./Card";

export function PIC({ className }: { className?: string }) {
  const pic = useSimulator(state => state.devices.pic);

  return (
    <Card title="PIC" className={className}>
      <div className="flex flex-wrap gap-4">
        <Card title="Estado">
          <table>
            <tbody className="divide-y">
              <tr className="divide-x">
                <td className="px-2 text-center font-bold text-slate-800">EOI</td>
                <td className="px-2 text-center font-mono text-slate-600">
                  {renderMemoryCell(pic.EOI, "bin")}
                </td>
              </tr>
              <tr className="divide-x">
                <td className="px-2 text-center font-bold text-slate-800">IMR</td>
                <td className="px-2 text-center font-mono text-slate-600">
                  {renderMemoryCell(pic.IMR, "bin")}
                </td>
              </tr>
              <tr className="divide-x">
                <td className="px-2 text-center font-bold text-slate-800">IRR</td>
                <td className="px-2 text-center font-mono text-slate-600">
                  {renderMemoryCell(pic.IRR, "bin")}
                </td>
              </tr>
              <tr className="divide-x">
                <td className="px-2 text-center font-bold text-slate-800">ISR</td>
                <td className="px-2 text-center font-mono text-slate-600">
                  {renderMemoryCell(pic.ISR, "bin")}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title="Conexiones">
          <table>
            <tbody className="divide-y">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr className="divide-x" key={i}>
                  <td className="px-2 text-center font-bold text-slate-800">INT{i}</td>
                  <td className="px-2 text-center font-mono text-slate-600">
                    {renderMemoryCell(pic[`INT${i as 0}`], "uint")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Card>
  );
}
