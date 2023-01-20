import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { Card } from "./Card";

export function PIO({ className }: { className?: string }) {
  const translate = useTranslate();

  const pio = useSimulator(state => state.devices.pio);

  return (
    <Card title={translate("devices.internal.pio.name")} className={className}>
      <table>
        <thead>
          <tr className="divide-x border-b">
            <th></th>
            <th className="px-2 text-center font-bold text-slate-800">
              {translate("devices.internal.pio.data")}
            </th>
            <th className="px-2 text-center font-bold text-slate-800">
              {translate("devices.internal.pio.config")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr className="divide-x">
            <td className="px-2 text-center font-bold text-slate-800">
              {translate("devices.internal.pio.port", "A")}
            </td>
            <td
              className="px-2 text-center font-mono text-slate-600"
              title={translate("devices.ioRegister", "PA", 0x30)}
            >
              {renderMemoryCell(pio.PA, "bin")}
            </td>
            <td
              className="px-2 text-center font-mono text-slate-600"
              title={translate("devices.ioRegister", "CA", 0x32)}
            >
              {renderMemoryCell(pio.CA, "bin")}
            </td>
          </tr>
          <tr className="divide-x">
            <td className="px-2 text-center font-bold text-slate-800">
              {translate("devices.internal.pio.port", "B")}
            </td>
            <td
              className="px-2 text-center font-mono text-slate-600"
              title={translate("devices.ioRegister", "PB", 0x31)}
            >
              {renderMemoryCell(pio.PB, "bin")}
            </td>
            <td
              className="px-2 text-center font-mono text-slate-600"
              title={translate("devices.ioRegister", "CB", 0x33)}
            >
              {renderMemoryCell(pio.CB, "bin")}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
