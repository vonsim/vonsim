import { Card } from "@/ui/components/common/Card";
import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { cn } from "@/ui/lib/utils";

export const CONSOLE_ID = "vonsim-console";

export function Console({ className }: { className?: string }) {
  const translate = useTranslate();

  const { output, state, dispatch } = useSimulator(s => ({
    output: s.simulator.devices.console,
    state: s.state,
    dispatch: s.dispatch,
  }));

  return (
    <Card title={translate("devices.external.console")} className={className}>
      <textarea
        id={CONSOLE_ID}
        autoComplete="off"
        className={cn(
          "h-36 w-full bg-gray-200 p-1 ring-inset ring-sky-400 focus:outline-none",
          "resize-none overflow-y-auto whitespace-pre-wrap break-all align-bottom font-mono caret-transparent",
          state.type === "waiting-for-input" && "focus:ring",
        )}
        value={output}
        onInput={ev => {
          ev.preventDefault();
          dispatch("console.handleKey", ev.nativeEvent as InputEvent);
        }}
      />
    </Card>
  );
}
