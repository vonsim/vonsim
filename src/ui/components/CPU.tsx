import { shallow } from "zustand/shallow";

import { renderAddress, renderMemoryCell, renderWord, splitLowHigh } from "@/helpers";
import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { useSettings } from "../settings";
import { Card } from "./Card";
import { FrecuencyPicker } from "./FrecuencyPicker";

const generalRegisters = ["AX", "BX", "CX", "DX"] as const;

export function CPU({ className }: { className?: string }) {
  const translate = useTranslate();
  const { alu, registers } = useSimulator(
    state => ({ alu: state.alu, registers: state.registers }),
    shallow,
  );

  const settings = useSettings(
    state => ({
      cpuSpeed: state.cpuSpeed,
      setCPUSpeed: state.setCPUSpeed,
      memoryRepresentation: state.memoryRepresentation,
    }),
    shallow,
  );

  return (
    <Card title={translate("cpu.name")} className={className}>
      <FrecuencyPicker
        value={settings.cpuSpeed}
        onChange={settings.setCPUSpeed}
        options={[1, 2, 4, 8, 16, 32, 64]}
      />

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <Card title={translate("cpu.general-registers")}>
          <table className="font-mono">
            <thead>
              <tr className="divide-x border-b">
                <th></th>
                {generalRegisters.map(reg => (
                  <th key={reg} className="text-center font-bold text-slate-800">
                    {reg}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="divide-x">
                <td className="w-[3ch] text-center font-bold text-slate-800">L</td>
                {generalRegisters.map(reg => (
                  <td key={reg} className="w-[10ch] text-center text-slate-600">
                    {renderMemoryCell(
                      splitLowHigh(registers[reg])[0],
                      settings.memoryRepresentation,
                    )}
                  </td>
                ))}
              </tr>

              <tr className="divide-x">
                <td className="w-[3ch] text-center font-bold text-slate-800">H</td>
                {generalRegisters.map(reg => (
                  <td key={reg} className="w-[10ch] text-center text-slate-600">
                    {renderMemoryCell(
                      splitLowHigh(registers[reg])[1],
                      settings.memoryRepresentation,
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title={translate("cpu.special-registers")}>
          <table className="font-mono">
            <thead>
              <tr className="divide-x border-b">
                <th className="text-center font-bold text-slate-800">IP</th>
                <th className="text-center font-bold text-slate-800">SP</th>
                <th className="text-center font-bold text-slate-800">IR</th>
                <th className="text-center font-bold text-slate-800">MAR</th>
                <th className="text-center font-bold text-slate-800">MBR</th>
              </tr>
            </thead>
            <tbody>
              <tr className="divide-x">
                <td className="w-[7ch] text-center text-slate-600">
                  {renderAddress(registers.IP)}
                </td>
                <td className="w-[7ch] text-center text-slate-600">
                  {renderAddress(registers.SP)}
                </td>
                <td className="w-[11ch] text-center text-slate-600">
                  {renderMemoryCell(registers.IR, "bin")}b
                </td>
                <td className="w-[7ch] text-center text-slate-600">
                  {renderAddress(registers.MAR)}
                </td>
                <td className="w-[7ch] text-center text-slate-600">
                  {renderAddress(registers.MBR)}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title={translate("cpu.alu")}>
          <div className="flex items-center justify-between gap-4">
            <div className="grid w-min grid-cols-[auto_17ch] gap-x-3 text-right font-mono">
              <div className="row-span-2 self-end font-bold text-slate-800">{alu.operation}</div>
              <div className="text-slate-600">{renderWord(alu.left)}</div>
              <div className="text-slate-600">{renderWord(alu.right)}</div>
              <div className="col-span-2 border-t" />
              <div className="col-span-2 text-slate-600">{renderWord(alu.result)}</div>
            </div>

            <table className="font-mono">
              <thead>
                <tr className="divide-x border-b">
                  <th className="text-center font-bold text-slate-800">C</th>
                  <th className="text-center font-bold text-slate-800">O</th>
                  <th className="text-center font-bold text-slate-800">S</th>
                  <th className="text-center font-bold text-slate-800">Z</th>
                </tr>
              </thead>
              <tbody>
                <tr className="divide-x">
                  <td className="w-[3ch] text-center text-slate-600">{Number(alu.flags.carry)}</td>
                  <td className="w-[3ch] text-center text-slate-600">
                    {Number(alu.flags.overflow)}
                  </td>
                  <td className="w-[3ch] text-center text-slate-600">{Number(alu.flags.sign)}</td>
                  <td className="w-[3ch] text-center text-slate-600">{Number(alu.flags.zero)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Card>
  );
}
