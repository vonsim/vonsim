import clsx from "clsx";
import { shallow } from "zustand/shallow";

import { useSimulator } from "@/simulator";
import { Card } from "@/ui/components/common/Card";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { useRunner } from "@/ui/lib/runner";

export const CONSOLE_ID = "vonsim-console";

export function Console({ className }: { className?: string }) {
  const translate = useTranslate();

  const output = useSimulator(state => state.devices.console.output);
  const { watingForInput, handleKeyInput } = useRunner(
    runner => ({
      watingForInput: runner.state.type === "waiting-for-input",
      handleKeyInput: runner.handleKeyInput,
    }),
    shallow,
  );

  return (
    <Card title={translate("devices.external.console")} className={className}>
      <textarea
        id={CONSOLE_ID}
        autoComplete="off"
        className={clsx(
          "h-36 w-full rounded-b-lg bg-gray-200 p-1 ring-inset ring-sky-400 focus:outline-none",
          "resize-none overflow-y-auto whitespace-pre-wrap break-all align-bottom font-mono caret-transparent",
          watingForInput && "focus:ring",
        )}
        value={output}
        onInput={ev => {
          ev.preventDefault();
          handleKeyInput(ev.nativeEvent as InputEvent);
        }}
      />
    </Card>
  );
}
