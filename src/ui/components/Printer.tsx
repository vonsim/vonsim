import { shallow } from "zustand/shallow";

import { PRINTER_BUFFER_SIZE } from "@/config";
import { Card } from "@/ui/components/common/Card";
import { FrecuencyPicker } from "@/ui/components/common/FrecuencyPicker";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { useSettings } from "@/ui/lib/settings";
import { cn } from "@/ui/lib/utils";

export function Printer({ className }: { className?: string }) {
  const translate = useTranslate();
  const settings = useSettings(
    state => ({
      printerSpeed: state.speeds.printer,
      setPrinterSpeed: (speed: number) => state.setSpeed("printer", speed),
    }),
    shallow,
  );

  const result = useSimulator(s => {
    if ("printer" in s.simulator.devices) return s.simulator.devices.printer;
    else return null;
  });

  // Printer is not connected
  if (!result) return null;

  const { buffer, output } = result;

  return (
    <Card title={translate("devices.external.printer.name")} className={className}>
      <div className="flex flex-col sm:flex-row">
        <div className="h-36 w-32 px-4 py-1">
          <FrecuencyPicker
            value={settings.printerSpeed}
            onChange={settings.setPrinterSpeed}
            options={[0.125, 0.25, 0.5, 1, 4, 16]}
          />

          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-700">
            {translate("devices.external.printer.buffer")}
          </p>
          <div className="flex font-mono">
            {Array.from({ length: PRINTER_BUFFER_SIZE }).map((_, i) => {
              const isEmpty = buffer.at(i) === undefined;

              return (
                <span
                  key={i}
                  className={cn(
                    "flex h-[2ch] w-[2ch] items-center justify-center border",
                    isEmpty ? "border-gray-200 bg-gray-50" : "border-sky-400 bg-sky-50",
                  )}
                >
                  {!isEmpty && buffer[i]}
                </span>
              );
            })}
          </div>
        </div>

        <pre className="h-36 w-[25ch] overflow-y-auto whitespace-pre-wrap break-all bg-gray-200 p-1 font-mono">
          {output}
        </pre>
      </div>
    </Card>
  );
}
