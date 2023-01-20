import { shallow } from "zustand/shallow";

import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { useSettings } from "../settings";
import { Card } from "./Card";

export function Timer({ className }: { className?: string }) {
  const translate = useTranslate();
  const memoryRepresentation = useSettings(state => state.memoryRepresentation);
  const { CONT, COMP } = useSimulator(
    state => ({
      CONT: state.devices.timer.CONT,
      COMP: state.devices.timer.COMP,
    }),
    shallow,
  );

  return (
    <Card title={translate("devices.internal.timer")} className={className}>
      <table>
        <thead>
          <tr className="divide-x border-b">
            <th className="px-2 text-center font-bold text-slate-800">CONT</th>
            <th className="px-2 text-center font-bold text-slate-800">COMP</th>
          </tr>
        </thead>
        <tbody>
          <tr className="divide-x">
            <td
              className="px-2 text-center font-mono text-slate-600"
              title={translate("devices.ioRegister", "CONT", 0x10)}
            >
              {renderMemoryCell(CONT, memoryRepresentation)}
            </td>
            <td
              className="px-2 text-center font-mono text-slate-600"
              title={translate("devices.ioRegister", "COMP", 0x11)}
            >
              {renderMemoryCell(COMP, memoryRepresentation)}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
