import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { Card } from "./Card";

export function Handshake({ className }: { className?: string }) {
  const translate = useTranslate();
  const handshake = useSimulator(state => state.devices.handshake);

  return (
    <Card title={translate("devices.internal.handshake.name")} className={className}>
      <table>
        <thead>
          <tr className="divide-x border-b">
            <th className="px-2 text-center font-bold text-slate-800">
              {translate("devices.internal.handshake.data")}
            </th>
            <th className="px-2 text-center font-bold text-slate-800">
              {translate("devices.internal.handshake.state")}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="divide-x">
            <td
              className="px-2 text-center font-mono text-slate-600"
              title={translate("devices.ioRegister", "DATA", 0x40)}
            >
              {renderMemoryCell(handshake.data, "ascii")}
            </td>
            <td
              className="px-2 text-center font-mono text-slate-600"
              title={translate("devices.ioRegister", "STATE", 0x41)}
            >
              {renderMemoryCell(handshake.state, "bin")}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
