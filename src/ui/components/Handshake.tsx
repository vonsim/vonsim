import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { Card } from "./common/Card";
import { Table } from "./common/Table";

export function Handshake({ className }: { className?: string }) {
  const translate = useTranslate();

  const handshake = useSimulator(state => state.devices.handshake);

  return (
    <Card title={translate("devices.internal.handshake.name")} className={className}>
      <Table
        columns={[
          translate("devices.internal.handshake.data"),
          translate("devices.internal.handshake.state"),
        ]}
        rows={[
          {
            cells: [
              {
                content: renderMemoryCell(handshake.data, "ascii"),
                title: translate("devices.ioRegister", "DATA", 0x40),
              },
              {
                content: renderMemoryCell(handshake.state, "bin"),
                title: translate("devices.ioRegister", "STATE", 0x41),
              },
            ],
          },
        ]}
      />
    </Card>
  );
}
