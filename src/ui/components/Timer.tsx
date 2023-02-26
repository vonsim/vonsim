import { renderMemoryCell } from "@/helpers";
import { Card } from "@/ui/components/common/Card";
import { Table } from "@/ui/components/common/Table";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";

export function Timer({ className }: { className?: string }) {
  const translate = useTranslate();

  const { CONT, COMP } = useSimulator(s => s.simulator.devices.timer);

  return (
    <Card title={translate("devices.internal.timer")} className={className}>
      <Table className="w-full">
        <Table.Head>
          <Table.ColLabel>CONT</Table.ColLabel>
          <Table.ColLabel>COMP</Table.ColLabel>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell title={translate("devices.ioRegister", "CONT", 0x10)}>
              {renderMemoryCell(CONT, "uint")}
            </Table.Cell>
            <Table.Cell title={translate("devices.ioRegister", "COMP", 0x11)}>
              {renderMemoryCell(COMP, "uint")}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Card>
  );
}
