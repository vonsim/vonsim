import clsx from "clsx";

import { useSimulator } from "@/simulator";

import { useTranslate } from "../hooks/useTranslate";
import { useRunner } from "../runner";
import { Card } from "./Card";

export const CONSOLE_ID = "vonsim-console";

export function Console({ className }: { className?: string }) {
  const translate = useTranslate();

  const output = useSimulator(state => state.devices.console.output);
  const watingForInput = useRunner(runner => runner.state.type === "waiting-for-input");

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
