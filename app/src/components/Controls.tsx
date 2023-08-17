import clsx from "clsx";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useSimulation } from "@/computer/simulation";
import { useTranslate } from "@/hooks/useTranslate";

export function Controls({ className }: { className?: string }) {
  const translate = useTranslate();

  const { status, dispatch } = useSimulation();

  return (
    <div className={clsx("flex items-center justify-center gap-4", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={status.type === "running"}
            onClick={() => dispatch("cpu.run", "infinity")}
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-mantis-500 px-3 text-sm font-medium leading-none text-white ring-offset-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mantis-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="icon-[lucide--play] mr-2 h-4 w-4" />
            {translate("control.action.start")}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuItem
            disabled={status.type === "running"}
            onClick={() => dispatch("cpu.run", "cycle-change")}
          >
            <span className="icon-[lucide--chevron-right] mr-2 h-4 w-4" />
            {translate("control.action.run.cycle-change")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={status.type === "running"}
            onClick={() => dispatch("cpu.run", "end-of-instruction")}
          >
            <span className="icon-[lucide--chevrons-right] mr-2 h-4 w-4" />
            {translate("control.action.run.end-of-instruction")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={status.type === "running"}
            onClick={() => dispatch("cpu.run", "infinity")}
          >
            <span className="icon-[lucide--infinity] mr-2 h-4 w-4" />
            {translate("control.action.run.infinity")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        disabled={status.type === "stopped"}
        onClick={() => dispatch("cpu.stop")}
        className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-mantis-500 px-3 text-sm font-medium leading-none text-white ring-offset-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mantis-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="icon-[lucide--stop-circle] mr-2 h-4 w-4" />
        {translate("control.action.stop")}
      </button>
    </div>
  );
}
