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
      <Table
        labelsSans
        columns={[translate("devices.internal.pio.data"), translate("devices.internal.pio.config")]}
        rows={[
          {
            label: translate("devices.internal.pio.port", "A"),
            cells: [
              {
                content: renderMemoryCell(pio.PA, "bin"),
                title: translate("devices.ioRegister", "PA", 0x30),
              },
              {
                content: renderMemoryCell(pio.CA, "bin"),
                title: translate("devices.ioRegister", "CA", 0x32),
              },
            ],
          },
          {
            label: translate("devices.internal.pio.port", "B"),
            cells: [
              {
                content: renderMemoryCell(pio.PB, "bin"),
                title: translate("devices.ioRegister", "PB", 0x31),
              },
              {
                content: renderMemoryCell(pio.CB, "bin"),
                title: translate("devices.ioRegister", "CB", 0x33),
              },
            ],
          },
        ]}
      />
    </Card>
  );
}
