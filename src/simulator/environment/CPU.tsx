import shallow from "zustand/shallow";

import { useComputer } from "../computer";
import { renderAddress, renderMemoryCell, renderWord, splitLowHigh } from "./helpers";

export function CPU() {
  const memoryRepresentation = useComputer(state => state.memoryRepresentation);
  const registers = useComputer(state => state.registers, shallow);
  const alu = useComputer(state => state.alu, shallow);

  return (
    <div className="rounded-lg bg-white px-4 py-2">
      <p className="font-extrabold uppercase tracking-wider text-gray-600">CPU</p>

      <table className="mt-4 font-mono">
        <thead>
          <tr>
            <th></th>
            <th className="text-center font-bold text-slate-800">L</th>
            <th className="text-center font-bold text-slate-800">H</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {(["AX", "BX", "CX", "DX"] as const).map(reg => {
            const [low, high] = splitLowHigh(registers[reg]);
            return (
              <tr className="divide-x" key={reg}>
                <td className="w-[4ch] text-center font-bold text-slate-800">{reg}</td>
                <td className="w-[10ch] text-center text-slate-600">
                  {renderMemoryCell(low, memoryRepresentation)}
                </td>
                <td className="w-[10ch] text-center text-slate-600">
                  {renderMemoryCell(high, memoryRepresentation)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <table className="mt-4 font-mono">
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
            <td className="w-[7ch] text-center text-slate-600">{renderAddress(registers.IP)}</td>
            <td className="w-[7ch] text-center text-slate-600">{renderAddress(registers.SP)}</td>
            <td className="w-[11ch] text-center text-slate-600">
              {renderMemoryCell(registers.IR, "bin")}b
            </td>
            <td className="w-[7ch] text-center text-slate-600">{renderAddress(registers.MAR)}</td>
            <td className="w-[7ch] text-center text-slate-600">{renderAddress(registers.MBR)}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 rounded-lg border-[1rem] border-gray-200 px-2 py-1">
        <p className="font-extrabold uppercase tracking-wider text-gray-600">ALU</p>

        <div className="flex items-center justify-between">
          <div className="grid w-min grid-cols-[auto_17ch] gap-x-3 text-right font-mono">
            <div className="row-span-2 self-end font-bold text-slate-800">{alu.operation}</div>
            <div className="">{renderWord(alu.left)}</div>
            <div className="">{renderWord(alu.right)}</div>
            <div className="col-span-2 border-t" />
            <div className="col-span-2">{renderWord(alu.result)}</div>
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
                <td className="w-[3ch] text-center text-slate-600">{Number(alu.flags.overflow)}</td>
                <td className="w-[3ch] text-center text-slate-600">{Number(alu.flags.sign)}</td>
                <td className="w-[3ch] text-center text-slate-600">{Number(alu.flags.zero)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
