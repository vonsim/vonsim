import { byteArray, renderMemoryCell } from "@/helpers";
import { Card } from "@/ui/components/common/Card";
import { Table } from "@/ui/components/common/Table";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";

const STATE = ["EOI", "IMR", "IRR", "ISR"] as const;
const CONNECTIONS = byteArray(i => `INT${i}` as const);

export function PIC({ className }: { className?: string }) {
  const translate = useTranslate();

  const pic = useSimulator(s => s.simulator.devices.pic);

  return (
    <Card title={translate("devices.internal.pic.name")} className={className}>
      <div className="flex flex-wrap justify-center gap-4 p-4">
        <Card title={translate("devices.internal.pic.state")}>
          <Table className="w-full">
            <Table.Body>
              {STATE.map((reg, i) => (
                <Table.Row key={i}>
                  <Table.RowLabel>{reg}</Table.RowLabel>
                  <Table.Cell title={translate("devices.ioRegister", reg, 0x20 + i)}>
                    {renderMemoryCell(pic[reg], "bin")}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>

        <Card title={translate("devices.internal.pic.connections")}>
          <Table className="w-full">
            <Table.Body>
              {CONNECTIONS.map((reg, i) => (
                <Table.Row key={i}>
                  <Table.RowLabel>{reg}</Table.RowLabel>
                  <Table.Cell title={translate("devices.ioRegister", reg, 0x24 + i)}>
                    {renderMemoryCell(pic[reg], "uint")}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </div>
    </Card>
  );
}
