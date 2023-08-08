import clsx from "clsx";
import { useAtom } from "jotai";
import { useLongPress, useToggle } from "react-use";

import { settingsOpenAtom } from "@/components/Settings";
import { useMobile } from "@/hooks/useMobile";
import { useTranslate } from "@/hooks/useTranslate";
import { cn } from "@/lib/utils";

import { Controls } from "./Controls";
import { State } from "./State";

/**
 * You'll see a mix of `isMobile` and `lg:*` in this and adjacent files.
 * Whenever you see `lg:*` it means that the element will behave
 * differently in mobile and desktop.
 *
 * I'd rather use pure CSS but I needed to use `isMobile`.
 */

export function Header() {
  const isMobile = useMobile();
  const translate = useTranslate();
  const [settingsOpen, setSettingsOpen] = useAtom(settingsOpenAtom);

  const [easterEgg, toggleEasterEgg] = useToggle(false);
  const easterEggEvents = useLongPress(
    () => {
      window.navigator.vibrate(100);
      toggleEasterEgg();
    },
    { isPreventDefault: true, delay: 1500 },
  );

  return (
    <header className="text-sm text-white">
      <div className="flex items-center lg:h-full">
        <div className="flex select-none items-center justify-center px-4 py-2">
          <span
            className={cn(
              "icon-[carbon--machine-learning] mr-2 block h-8 w-8",
              easterEgg && "animate-spin",
            )}
            {...easterEggEvents}
          />
          <h1 className="text-xl font-bold">
            Von<span className="text-mantis-400">Sim</span>
          </h1>
        </div>

        <State />

        {!isMobile && (
          <>
            <Controls />
            <div className="grow" />
          </>
        )}

        <button
          className={clsx(
            "mr-2 h-min w-min rounded-full p-2 transition-colors focus:outline-stone-400",
            settingsOpen
              ? "bg-stone-700 hover:bg-stone-600 focus:bg-stone-600"
              : "hover:bg-stone-800 focus:bg-stone-800",
          )}
          title={translate("settings.title")}
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <span className="icon-[lucide--settings] block h-6 w-6" />
        </button>
      </div>

      {isMobile && <Controls />}
    </header>
  );
}
