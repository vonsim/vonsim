import { Card } from "@/components/common/Card";
import { Table } from "@/components/common/Table";
import { useTranslate } from "@/hooks/useTranslate";
import { useAtomValue } from "@/lib/jotai";
import { CAAtom, CBAtom, PAAtom, PBAtom } from "@/simulator/components/pio";

export function PIO({ className }: { className?: string }) {
  const translate = useTranslate();

  const PA = useAtomValue(PAAtom);
  const PB = useAtomValue(PBAtom);
  const CA = useAtomValue(CAAtom);
  const CB = useAtomValue(CBAtom);

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
              {PA.toString("bin")}
            </Table.Cell>
            <Table.Cell title={translate("devices.ioRegister", "CA", 0x32)}>
              {CA.toString("bin")}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowLabel className="font-sans">
              {translate("devices.internal.pio.port", "B")}
            </Table.RowLabel>
            <Table.Cell title={translate("devices.ioRegister", "PB", 0x31)}>
              {PB.toString("bin")}
            </Table.Cell>
            <Table.Cell title={translate("devices.ioRegister", "CB", 0x33)}>
              {CB.toString("bin")}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Card>
  );
}
