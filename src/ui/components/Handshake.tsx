import { renderMemoryCell } from "@/helpers";
import { Card } from "@/ui/components/common/Card";
import { Table } from "@/ui/components/common/Table";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";

export function Handshake({ className }: { className?: string }) {
  const translate = useTranslate();

  const handshake = useSimulator(s => {
    if ("handshake" in s.simulator.devices) return s.simulator.devices.handshake;
    return null;
  });

  // Handshake is not connected
  if (!handshake) return null;

  return (
    <Card title={translate("devices.internal.handshake.name")} className={className}>
      <Table className="w-full">
        <Table.Head>
          <Table.ColLabel className="font-sans">
            {translate("devices.internal.handshake.data")}
          </Table.ColLabel>
          <Table.ColLabel className="font-sans">
            {translate("devices.internal.handshake.state")}
          </Table.ColLabel>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell title={translate("devices.ioRegister", "DATA", 0x40)}>
              {renderMemoryCell(handshake.data, "ascii")}
            </Table.Cell>
            <Table.Cell title={translate("devices.ioRegister", "STATE", 0x41)}>
              {renderMemoryCell(handshake.state, "bin")}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Card>
  );
}
