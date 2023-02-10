import { useLongPress, useToggle } from "react-use";

import { useMobile } from "@/ui/hooks/useMobile";
import { cn } from "@/ui/lib/utils";

import { Controls } from "./Controls";
import { MainMenu } from "./MainMenu";
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

  const [easterEgg, toggleEasterEgg] = useToggle(false);
  const easterEggEvents = useLongPress(
    () => {
      window.navigator.vibrate(100);
      toggleEasterEgg();
    },
    { isPreventDefault: true, delay: 1500 },
  );

  return (
    <header className="border-b border-slate-500/30 bg-slate-800 text-sm text-white">
      <div className="flex items-center lg:h-full">
        <div className="flex select-none items-center justify-center py-2 px-4">
          <span
            className={cn(
              "icon-[carbon--machine-learning] mr-2 block h-8 w-8",
              easterEgg && "animate-spin",
            )}
            {...easterEggEvents}
          />
          <h1 className="text-xl font-bold">
            Von<span className="text-sky-400">Sim</span>
          </h1>
        </div>

        <State />

        {!isMobile && (
          <>
            <Controls />
            <div className="grow" />
          </>
        )}

        <MainMenu />
      </div>

      {isMobile && <Controls />}
    </header>
  );
}
