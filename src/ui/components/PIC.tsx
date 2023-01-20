import { byteArray, renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { Card } from "./Card";
import { Table } from "./Table";

const STATE = ["EOI", "IMR", "IRR", "ISR"] as const;
const CONNECTIONS = byteArray(i => `INT${i}` as const);

export function PIC({ className }: { className?: string }) {
  const translate = useTranslate();

  const pic = useSimulator(state => state.devices.pic);

  return (
    <Card title={translate("devices.internal.pic.name")} className={className}>
      <div className="flex flex-wrap justify-center gap-4 p-4">
        <Card title={translate("devices.internal.pic.state")}>
          <Table
            rows={STATE.map((reg, i) => ({
              label: reg,
              cells: [
                {
                  content: renderMemoryCell(pic[reg], "bin"),
                  title: translate("devices.ioRegister", reg, 0x20 + i),
                },
              ],
            }))}
          />
        </Card>

        <Card title={translate("devices.internal.pic.connections")}>
          <Table
            className="w-full"
            rows={CONNECTIONS.map((reg, i) => ({
              label: reg,
              cells: [
                {
                  content: renderMemoryCell(pic[reg], "uint"),
                  title: translate("devices.ioRegister", reg, 0x24 + i),
                },
              ],
            }))}
          />
        </Card>
      </div>
    </Card>
  );
}
