import { displayCharacter } from "@vonsim/common/ascii";
import { useAtomValue } from "jotai";

import { Card } from "@/components/common/Card";
import { Table } from "@/components/common/Table";
import { useTranslate } from "@/hooks/useTranslate";
import { DATAAtom, STATEAtom } from "@/simulator/components/handshake";

export function Handshake({ className }: { className?: string }) {
  const translate = useTranslate();

  const DATA = useAtomValue(DATAAtom);
  const STATE = useAtomValue(STATEAtom);

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
              {displayCharacter(DATA.unsigned)}
            </Table.Cell>
            <Table.Cell title={translate("devices.ioRegister", "STATE", 0x41)}>
              {STATE.toString("bin")}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Card>
  );
}
