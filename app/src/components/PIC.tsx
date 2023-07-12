import { Card } from "@/components/common/Card";
import { Table } from "@/components/common/Table";
import { useTranslate } from "@/hooks/useTranslate";
import { useAtomValue } from "@/lib/jotai";
import { IMRAtom, IRRAtom, ISRAtom, linesAtom } from "@/simulator/components/pic";

export function PIC({ className }: { className?: string }) {
  const translate = useTranslate();

  const IMR = useAtomValue(IMRAtom);
  const IRR = useAtomValue(IRRAtom);
  const ISR = useAtomValue(ISRAtom);
  const lines = useAtomValue(linesAtom);

  return (
    <Card title={translate("devices.internal.pic.name")} className={className}>
      <div className="flex flex-wrap justify-center gap-4 p-4">
        <Card title={translate("devices.internal.pic.state")}>
          <Table className="w-full">
            <Table.Body>
              <Table.Row>
                <Table.RowLabel>IMR</Table.RowLabel>
                <Table.Cell title={translate("devices.ioRegister", "IMR", 0x21)}>
                  {IMR.toString("bin")}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>IRR</Table.RowLabel>
                <Table.Cell title={translate("devices.ioRegister", "IRR", 0x22)}>
                  {IRR.toString("bin")}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>ISR</Table.RowLabel>
                <Table.Cell title={translate("devices.ioRegister", "ISR", 0x23)}>
                  {ISR.toString("bin")}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Card>

        <Card title={translate("devices.internal.pic.connections")}>
          <Table className="w-full">
            <Table.Body>
              {lines.map((line, i) => (
                <Table.Row key={i}>
                  <Table.RowLabel>INT{i}</Table.RowLabel>
                  <Table.Cell title={translate("devices.ioRegister", `INT${i}`, 0x24 + i)}>
                    {line.toString("uint")}
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
