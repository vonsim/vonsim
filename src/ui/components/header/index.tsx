import clsx from "clsx";
import { useLongPress, useToggle } from "react-use";

import { useMobile } from "@/ui/hooks/useMobile";
import { useTranslate } from "@/ui/hooks/useTranslate";
import DocumentationIcon from "~icons/carbon/document";
import GitHubIcon from "~icons/carbon/logo-github";
import Logo from "~icons/carbon/machine-learning";

import { Controls } from "./Controls";
import { LangPicker } from "./LangPicker";
import { State } from "./State";

/**
 * You'll see a mix of `isMobile` and `lg:*` in this and adjacent files.
 * Whenever you see `lg:*` it means that the element will behave
 * differently in mobile and desktop.
 *
 * I'd rather use pure CSS but I needed to use `isMobile`.
 */

export function Header() {
  const translate = useTranslate();
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
          <Logo
            className={clsx("mr-2 h-8 w-8", easterEgg && "animate-spin")}
            {...easterEggEvents}
          />
          <h1 className="text-xl font-bold">
            Von<span className="text-sky-400">Sim</span>
          </h1>
        </div>

        {!isMobile && (
          <>
            <State />
            <Controls />
          </>
        )}

        <div className="grow" />

        <LangPicker />
        <a
          className="flex h-full items-center p-2 transition hover:bg-slate-500/30"
          href="/docs"
          title={translate("documentation")}
        >
          <DocumentationIcon className="h-5 w-5" />
        </a>
        <a
          className="mr-4 flex h-full items-center p-2 transition hover:bg-slate-500/30"
          href="https://github.com/vonsim/vonsim"
          target="_blank"
          title="GitHub"
          rel="noreferrer"
        >
          <GitHubIcon className="h-5 w-5" />
        </a>
      </div>

      {isMobile && (
        <div className="">
          <State />
          <Controls />
        </div>
      )}
    </header>
  );
}
