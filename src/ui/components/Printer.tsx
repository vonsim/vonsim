import { shallow } from "zustand/shallow";

import { PRINTER_BUFFER_SIZE } from "@/config";
import { Card } from "@/ui/components/common/Card";
import { FrequencyPicker } from "@/ui/components/common/FrequencyPicker";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { useSettings } from "@/ui/lib/settings";
import { cn } from "@/ui/lib/utils";

import styles from "./Printer.module.css";

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
    if ("printer" in s.simulator.devices) {
      return { ...s.simulator.devices.printer, dispatch: s.dispatch };
    }
    return null;
  });

  // Printer is not connected
  if (!result) return null;

  const { buffer, output, dispatch } = result;

  return (
    <Card
      title={translate("devices.external.printer.name")}
      className={className}
      actions={[
        {
          title: translate("clean"),
          icon: "icon-[carbon--clean]",
          onClick: () => dispatch("printer.clean"),
        },
      ]}
    >
      <div className="flex flex-col">
        <div className="flex">
          <FrequencyPicker
            className="py-2 px-4"
            value={settings.printerSpeed}
            onChange={settings.setPrinterSpeed}
            options={[0.125, 0.25, 0.5, 1, 4, 16]}
          />

          <div className="px-4 py-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {translate("devices.external.printer.buffer")}
            </label>
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
        </div>

        <hr />

        <div className={styles.paper}>
          <pre className={styles.inner}>{output}</pre>
        </div>
      </div>
    </Card>
  );
}
