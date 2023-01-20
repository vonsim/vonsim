import clsx from "clsx";
import { shallow } from "zustand/shallow";

import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { Card } from "./Card";

export const CONSOLE_ID = "vonsim-console";

export function Console({ className }: { className?: string }) {
  const translate = useTranslate();

  const { output, watingForInput } = useSimulator(
    state => ({
      output: state.devices.console.output,
      watingForInput: state.runner === "waiting-for-input",
    }),
    shallow,
  );

  return (
    <Card title={translate("devices.external.console")} className={className}>
      <pre
        id={CONSOLE_ID}
        className={clsx(
          "h-36 overflow-y-auto whitespace-pre-wrap break-all rounded-b-lg bg-gray-200 p-1 font-mono ring-inset ring-sky-400",
          watingForInput && "ring",
        )}
      >
        {output}
        {watingForInput && <span className="animate-pulse text-sky-400">█</span>}
      </pre>
    </Card>
  );
}
