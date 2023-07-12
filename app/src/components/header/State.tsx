import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";
import { cn } from "@/lib/utils";

export function State() {
  const translate = useTranslate();

  const [status] = useSimulator();

  return (
    <div
      className={cn(
        "mx-auto flex h-6 w-40 select-none items-center justify-center gap-1 rounded-full lg:mx-8",
        "text-center text-sm font-semibold",
        status.type === "running" && "bg-emerald-200 text-emerald-700",
        status.type === "paused" && "bg-amber-200 text-amber-700",
        status.type === "waiting-for-input" && "bg-amber-200 text-amber-700",
        status.type === "stopped" &&
          (status.reason === "halt" ? "bg-sky-200 text-sky-700" : "bg-red-200 text-red-700"),
      )}
    >
      <span
        className={cn(
          "h-4 w-4",
          status.type === "running" && "icon-[carbon--settings] animate-spin",
          status.type === "paused" && "icon-[carbon--pause] animate-pulse",
          status.type === "waiting-for-input" && "icon-[carbon--keyboard] animate-bounce",
          status.type === "stopped" && [
            status.reason === "halt" && "icon-[carbon--stop-sign]",
            status.reason === "error" && "icon-[carbon--error]",
          ],
        )}
      />
      <span>{translate(`runner.state.${status.type}`)}</span>
    </div>
  );
}
