import { useSimulator } from "@/ui/hooks/useSimulator";
import { useTranslate } from "@/ui/hooks/useTranslate";
import { cn } from "@/ui/lib/utils";

export function State() {
  const translate = useTranslate();

  const state = useSimulator(s => s.state);

  return (
    <div
      className={cn(
        "mx-auto flex h-6 w-40 select-none items-center justify-center gap-1 rounded-full lg:mx-8",
        "text-center text-sm font-semibold",
        state.type === "running" && "bg-emerald-200 text-emerald-700",
        state.type === "paused" && "bg-amber-200 text-amber-700",
        state.type === "waiting-for-input" && "bg-amber-200 text-amber-700",
        state.type === "stopped" &&
          (state.reason === "halt" ? "bg-sky-200 text-sky-700" : "bg-red-200 text-red-700"),
      )}
    >
      <span
        className={cn(
          "h-4 w-4",
          state.type === "running" && "icon-[carbon--settings] animate-spin",
          state.type === "paused" && "icon-[carbon--pause] animate-pulse",
          state.type === "waiting-for-input" && "icon-[carbon--keyboard] animate-bounce",
          state.type === "stopped" && [
            state.reason === "halt" && "icon-[carbon--stop-sign]",
            state.reason === "error" && "icon-[carbon--error]",
          ],
        )}
      />
      <span>{translate(`runner.state.${state.type}`)}</span>
    </div>
  );
}
