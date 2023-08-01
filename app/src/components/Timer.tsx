import { useAtomValue } from "jotai";

import { Card } from "@/components/common/Card";
import { Table } from "@/components/common/Table";
import { useTranslate } from "@/hooks/useTranslate";
import { COMPAtom, CONTAtom } from "@/simulator/components/timer";

export function Timer({ className }: { className?: string }) {
  const translate = useTranslate();

  const CONT = useAtomValue(CONTAtom);
  const COMP = useAtomValue(COMPAtom);

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
              {CONT.toString("uint")}
            </Table.Cell>
            <Table.Cell title={translate("devices.ioRegister", "COMP", 0x11)}>
              {COMP.toString("uint")}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Card>
  );
}
