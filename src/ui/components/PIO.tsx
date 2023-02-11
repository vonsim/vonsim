import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";
import { Card } from "@/ui/components/common/Card";
import { Table } from "@/ui/components/common/Table";
import { useTranslate } from "@/ui/hooks/useTranslate";

export function PIO({ className }: { className?: string }) {
  const translate = useTranslate();

  const pio = useSimulator(state => state.devices.pio);

  return (
    <Card title={translate("devices.internal.pio.name")} className={className}>
      <Table className="w-full">
        <Table.Head>
          <Table.ColLabel />
          <Table.ColLabel className="font-sans">
            {translate("devices.internal.pio.data")}
          </Table.ColLabel>
          <Table.ColLabel className="font-sans">
            {translate("devices.internal.pio.config")}
          </Table.ColLabel>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.RowLabel className="font-sans">
              {translate("devices.internal.pio.port", "A")}
            </Table.RowLabel>
            <Table.Cell title={translate("devices.ioRegister", "PA", 0x30)}>
              {renderMemoryCell(pio.PA, "bin")}
            </Table.Cell>
            <Table.Cell title={translate("devices.ioRegister", "CA", 0x32)}>
              {renderMemoryCell(pio.CA, "bin")}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowLabel className="font-sans">
              {translate("devices.internal.pio.port", "B")}
            </Table.RowLabel>
            <Table.Cell title={translate("devices.ioRegister", "PB", 0x31)}>
              {renderMemoryCell(pio.PB, "bin")}
            </Table.Cell>
            <Table.Cell title={translate("devices.ioRegister", "CB", 0x33)}>
              {renderMemoryCell(pio.CB, "bin")}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Card>
  );
}
