import { useAtom, useAtomValue } from "jotai";

import { Card } from "@/components/common/Card";
import { FrequencyPicker } from "@/components/common/FrequencyPicker";
import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";
import { speedsAtom } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { bufferAtom, paperAtom } from "@/simulator/components/printer";

import styles from "./Printer.module.css";

// TODO: move somewhere elese
const PRINTER_BUFFER_SIZE = 5;

export function Printer({ className }: { className?: string }) {
  const translate = useTranslate();
  const [speeds, setSpeeds] = useAtom(speedsAtom);

  const [, dispatch] = useSimulator();

  const buffer = useAtomValue(bufferAtom);
  const paper = useAtomValue(paperAtom);

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
            className="px-4 py-2"
            value={speeds.printer}
            onChange={(hz: number) => setSpeeds({ ...speeds, printer: hz })}
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
                    {!isEmpty && buffer[i].toString("ascii")}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <hr />

        <div className={styles.paper}>
          <pre className={styles.inner}>{paper}</pre>
        </div>
      </div>
    </Card>
  );
}
