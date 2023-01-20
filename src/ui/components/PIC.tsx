import { ByteRange, renderMemoryCell } from "@/helpers";
import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { Card } from "./Card";

export function PIC({ className }: { className?: string }) {
  const translate = useTranslate();

  const pic = useSimulator(state => state.devices.pic);

  return (
    <Card title={translate("devices.internal.pic.name")} className={className}>
      <div className="flex flex-wrap gap-4">
        <Card title={translate("devices.internal.pic.state")}>
          <table>
            <tbody className="divide-y">
              <tr className="divide-x">
                <td className="px-2 text-center font-bold text-slate-800">EOI</td>
                <td
                  className="px-2 text-center font-mono text-slate-600"
                  title={translate("devices.ioRegister", "EOI", 0x20)}
                >
                  {renderMemoryCell(pic.EOI, "bin")}
                </td>
              </tr>
              <tr className="divide-x">
                <td className="px-2 text-center font-bold text-slate-800">IMR</td>
                <td
                  className="px-2 text-center font-mono text-slate-600"
                  title={translate("devices.ioRegister", "IMR", 0x21)}
                >
                  {renderMemoryCell(pic.IMR, "bin")}
                </td>
              </tr>
              <tr className="divide-x">
                <td className="px-2 text-center font-bold text-slate-800">IRR</td>
                <td
                  className="px-2 text-center font-mono text-slate-600"
                  title={translate("devices.ioRegister", "IRR", 0x22)}
                >
                  {renderMemoryCell(pic.IRR, "bin")}
                </td>
              </tr>
              <tr className="divide-x">
                <td className="px-2 text-center font-bold text-slate-800">ISR</td>
                <td
                  className="px-2 text-center font-mono text-slate-600"
                  title={translate("devices.ioRegister", "ISR", 0x23)}
                >
                  {renderMemoryCell(pic.ISR, "bin")}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title={translate("devices.internal.pic.connections")}>
          <table>
            <tbody className="divide-y">
              {Array.from({ length: 8 }).map((_, i) => {
                const int = `INT${i as ByteRange}` as const;

                return (
                  <tr className="divide-x" key={i}>
                    <td className="px-2 text-center font-bold text-slate-800">{int}</td>
                    <td
                      className="px-2 text-center font-mono text-slate-600"
                      title={translate("devices.ioRegister", int, 0x24 + i)}
                    >
                      {renderMemoryCell(pic[int], "uint")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </Card>
  );
}
