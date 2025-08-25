import clsx from "clsx";
import { useAtom } from "jotai";

import { Controls } from "@/components/Controls";
import { settingsOpenAtom } from "@/components/Settings";
import { useTranslate } from "@/lib/i18n";

export function Header() {
  const translate = useTranslate();
  const [settingsOpen, setSettingsOpen] = useAtom(settingsOpenAtom);

  return (
    <header className="text-foreground relative h-28 p-2 text-sm max-sm:min-h-28 sm:h-16">
      <Controls className="absolute inset-x-2 bottom-0 top-12 *:w-full sm:top-0 sm:*:w-80" />

      <div className="flex items-center justify-between">
        <div className="flex select-none items-center justify-center">
          <img src="/favicon.svg" className="mr-2 size-10" />
          <h1 className="text-xl font-bold max-sm:hidden">
            Von<span className="text-primary-1">Sim</span>
          </h1>
        </div>

        <button
          className={clsx(
            "focus:outline-border size-min rounded-md p-2 transition-colors",
            settingsOpen
              ? "bg-background-2 hover:bg-background-3 focus:bg-background-3"
              : "hover:bg-background-1 focus:bg-background-1",
          )}
          title={translate("settings.title")}
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <span className="icon-[lucide--settings] block size-6" />
        </button>
      </div>
    </header>
  );
}
