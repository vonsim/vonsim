import { shallow } from "zustand/shallow";

import { renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";
import { Card } from "@/ui/components/common/Card";
import { Table } from "@/ui/components/common/Table";
import { useTranslate } from "@/ui/hooks/useTranslate";

export function Timer({ className }: { className?: string }) {
  const translate = useTranslate();

  const { CONT, COMP } = useSimulator(
    state => ({
      CONT: state.devices.timer.CONT,
      COMP: state.devices.timer.COMP,
    }),
    shallow,
  );

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
