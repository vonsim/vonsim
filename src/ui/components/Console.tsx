import clsx from "clsx";
import { useSimulator } from "~/simulator";
import { Card } from "./Card";

export const CONSOLE_ID = "vonsim-console";

export function Console() {
  const contents = useSimulator(state => state.devices.console);
  const watingForInput = useSimulator(state => state.runner === "waiting-for-input");

  return (
    <Card title="Consola" noPadding>
      <pre
        id={CONSOLE_ID}
        className={clsx(
          "h-36 overflow-y-auto whitespace-pre-wrap break-all bg-gray-200 p-1 font-mono ring-inset ring-sky-400",
          watingForInput && "ring",
        )}
      >
        {contents}
        {watingForInput && <span className="animate-pulse text-sky-400">█</span>}
      </pre>
    </Card>
  );
}
