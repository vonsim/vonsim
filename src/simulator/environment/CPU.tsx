import shallow from "zustand/shallow";

import { useComputer } from "./computer";
import { useConfig } from "./config";
import { renderAddress, renderMemoryCell, splitLowHigh } from "./helpers";

export function CPU() {
  const config = useConfig();
  const registers = useComputer(state => state.registers, shallow);

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
                  {renderMemoryCell(low, config.memoryRepresentation)}
                </td>
                <td className="w-[10ch] text-center text-slate-600">
                  {renderMemoryCell(high, config.memoryRepresentation)}
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
            <td className="w-[7ch] text-center text-slate-600">{renderAddress(registers.IR)}</td>
            <td className="w-[7ch] text-center text-slate-600">{renderAddress(registers.MAR)}</td>
            <td className="w-[7ch] text-center text-slate-600">{renderAddress(registers.MBR)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
