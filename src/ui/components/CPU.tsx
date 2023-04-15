import { shallow } from "zustand/shallow";

import { renderAddress, renderMemoryCell, renderWord, splitLowHigh } from "@/helpers";
import { Card } from "@/ui/components/common/Card";
import { CellView } from "@/ui/components/common/CellView";
import { FrequencyPicker } from "@/ui/components/common/FrequencyPicker";
import { Table } from "@/ui/components/common/Table";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { useSettings } from "@/ui/lib/settings";

const REGISTERS = ["AX", "BX", "CX", "DX"] as const;

export function CPU({ className }: { className?: string }) {
  const translate = useTranslate();
  const settings = useSettings(
    state => ({
      cpuSpeed: state.speeds.cpu,
      setCPUSpeed: (speed: number) => state.setSpeed("cpu", speed),
      memoryRepresentation: state.memoryRepresentation,
    }),
    shallow,
  );

  const { alu, registers, interrupts } = useSimulator(s => s.simulator.cpu);

  return (
    <Card title={translate("cpu.name")} className={className}>
      <div className="flex">
        <FrequencyPicker
          className="px-4 py-2"
          value={settings.cpuSpeed}
          onChange={settings.setCPUSpeed}
          options={[1, 2, 4, 8, 16, 32, 64]}
        />

        <div className="px-4 py-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {translate("cpu.interrups.label")}
          </label>
          <p>{translate(`cpu.interrups.${interrupts ? "enabled" : "disabled"}`)}</p>
        </div>
      </div>

      <hr />

      <div className="flex flex-wrap justify-center gap-4 p-4">
        <Card title={translate("cpu.general-registers")}>
          <Table className="w-full">
            <Table.Head>
              <Table.ColLabel />
              <Table.ColLabel>L</Table.ColLabel>
              <Table.ColLabel>H</Table.ColLabel>
            </Table.Head>
            <Table.Body>
              {REGISTERS.map(reg => {
                const [low, high] = splitLowHigh(registers[reg]);
                return (
                  <Table.Row key={reg}>
                    <Table.RowLabel>{reg}</Table.RowLabel>
                    <Table.Cell className="w-byte p-0">
                      <CellView name={translate("cpu.register", `${reg[0]}L`)} value={low} />
                    </Table.Cell>
                    <Table.Cell className="w-byte p-0">
                      <CellView name={translate("cpu.register", `${reg[0]}H`)} value={high} />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Card>

        <Card title={translate("cpu.special-registers")}>
          <Table className="w-full">
            <Table.Body>
              <Table.Row>
                <Table.RowLabel>IP</Table.RowLabel>
                <Table.Cell>{renderAddress(registers.IP)}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>SP</Table.RowLabel>
                <Table.Cell>{renderAddress(registers.SP)}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>IR</Table.RowLabel>
                <Table.Cell>{renderMemoryCell(registers.IR, "bin")}b</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>MAR</Table.RowLabel>
                <Table.Cell>{renderAddress(registers.MAR)}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowLabel>MBR</Table.RowLabel>
                <Table.Cell>{renderAddress(registers.MBR)}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Card>

        <Card title={translate("cpu.alu")}>
          <div className="grid w-min grid-cols-[3ch_17ch] gap-x-2 p-2 font-mono">
            <div className="row-span-2 self-end text-right font-bold text-slate-800">
              {alu.operation}
            </div>
            <div className="text-left text-slate-600">{renderWord(alu.left)}</div>
            <div className="text-left text-slate-600">{renderWord(alu.right)}</div>
            <span />
            <div className="border-t" />
            <span />
            <div className="text-left text-slate-600">{renderWord(alu.result)}</div>
          </div>
          <hr />
          <Table className="w-full">
            <Table.Head>
              <Table.ColLabel>C</Table.ColLabel>
              <Table.ColLabel>O</Table.ColLabel>
              <Table.ColLabel>S</Table.ColLabel>
              <Table.ColLabel>Z</Table.ColLabel>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell>{alu.flags.carry ? "1" : "0"}</Table.Cell>
                <Table.Cell>{alu.flags.overflow ? "1" : "0"}</Table.Cell>
                <Table.Cell>{alu.flags.sign ? "1" : "0"}</Table.Cell>
                <Table.Cell>{alu.flags.zero ? "1" : "0"}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Card>
      </div>
    </Card>
  );
}
