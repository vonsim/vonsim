import { shallow } from "zustand/shallow";

import { renderAddress, renderMemoryCell, renderWord, splitLowHigh } from "@/helpers";
import { useSimulator } from "@/simulator";
import { Card } from "@/ui/components/common/Card";
import { FrecuencyPicker } from "@/ui/components/common/FrecuencyPicker";
import { Table } from "@/ui/components/common/Table";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { useSettings } from "@/ui/settings";

const REGISTERS = ["AX", "BX", "CX", "DX"] as const;

export function CPU({ className }: { className?: string }) {
  const translate = useTranslate();
  const settings = useSettings(
    state => ({
      cpuSpeed: state.cpuSpeed,
      setCPUSpeed: state.setCPUSpeed,
      memoryRepresentation: state.memoryRepresentation,
    }),
    shallow,
  );

  const { alu, registers, interruptsEnabled } = useSimulator(
    state => ({
      alu: state.alu,
      registers: state.registers,
      interruptsEnabled: state.interruptsEnabled,
    }),
    shallow,
  );

  return (
    <Card title={translate("cpu.name")} className={className}>
      <div className="flex">
        <FrecuencyPicker
          className="py-2 px-4"
          value={settings.cpuSpeed}
          onChange={settings.setCPUSpeed}
          options={[1, 2, 4, 8, 16, 32, 64]}
        />

        <div className="px-4 py-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {translate("cpu.interrups.label")}
          </label>
          <p>{translate(`cpu.interrups.${interruptsEnabled ? "enabled" : "disabled"}`)}</p>
        </div>
      </div>

      <hr />

      <div className="flex flex-wrap justify-center gap-4 p-4">
        <Card title={translate("cpu.general-registers")}>
          <Table
            className="w-full"
            columns={["L", "H"]}
            rows={REGISTERS.map(reg => ({
              label: reg,
              cells: splitLowHigh(registers[reg]).map(cell => ({
                content: cell,
                renderMemory: true,
              })),
            }))}
          />
        </Card>

        <Card title={translate("cpu.special-registers")}>
          <Table
            className="w-full"
            rows={[
              { label: "IP", cells: [{ content: renderAddress(registers.IP) }] },
              { label: "SP", cells: [{ content: renderAddress(registers.SP) }] },
              { label: "IR", cells: [{ content: renderMemoryCell(registers.IR, "bin") + "b" }] },
              { label: "MAR", cells: [{ content: renderAddress(registers.MAR) }] },
              { label: "MBR", cells: [{ content: renderAddress(registers.MBR) }] },
            ]}
          />
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
          <Table
            className="w-full"
            columns={["C", "O", "S", "Z"]}
            rows={[
              {
                cells: [
                  { content: alu.flags.carry ? "1" : "0" },
                  { content: alu.flags.overflow ? "1" : "0" },
                  { content: alu.flags.sign ? "1" : "0" },
                  { content: alu.flags.zero ? "1" : "0" },
                ],
              },
            ]}
          />
        </Card>
      </div>
    </Card>
  );
}
