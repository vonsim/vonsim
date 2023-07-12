import { useCallback } from "react";
import { useEvent } from "react-use";

import { useSimulator } from "@/hooks/useSimulator";
import { useTranslate } from "@/hooks/useTranslate";
import { cn } from "@/lib/utils";

export function Controls() {
  const translate = useTranslate();

  const [status, dispatch] = useSimulator();

  const onKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key === "F5") {
        ev.preventDefault();
        if (ev.shiftKey) dispatch("stop");
        else dispatch("run");
      } else if (ev.key === "F11") {
        ev.preventDefault();
        dispatch("step");
      }
    },
    [dispatch],
  );

  useEvent("keydown", onKeyDown, undefined, [dispatch]);

  return (
    <div className="flex h-12 items-center justify-center gap-4 lg:h-full lg:justify-start">
      {status.type === "stopped" ? (
        <>
          <Button onClick={() => dispatch("run")} title="F5" icon="icon-[carbon--play]">
            {translate("runner.action.start")}
          </Button>

          <Button onClick={() => dispatch("step")} title="F11" icon="icon-[carbon--debug]">
            {translate("runner.action.debug")}
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={() => dispatch("run")}
            title="F5"
            icon="icon-[carbon--skip-forward]"
            disabled={status.type !== "paused"}
          >
            {translate("runner.action.run-until-halt")}
          </Button>

          <Button
            onClick={() => dispatch("step")}
            title="F11"
            icon="icon-[carbon--play]"
            disabled={status.type !== "paused"}
          >
            {translate("runner.action.step")}
          </Button>

          <Button onClick={() => dispatch("stop")} title="Shift+F5" icon="icon-[carbon--stop-sign]">
            {translate("runner.action.stop")}
          </Button>
        </>
      )}
    </div>
  );
}

function Button({
  icon,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: string }) {
  return (
    <button
      {...props}
      className="
        flex h-full items-center justify-center border-b border-sky-400 p-2 transition hover:bg-slate-500/30
        disabled:border-slate-500 disabled:text-slate-500 disabled:hover:bg-transparent
      "
    >
      <span className={cn("mr-1 block h-5 w-5", icon)} /> {children}
    </button>
  );
}
