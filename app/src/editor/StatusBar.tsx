import clsx from "clsx";
import { atom, useAtomValue } from "jotai";

import { useTranslate } from "@/lib/i18n";

export const lintErrorsAtom = atom(0);

export function StatusBar() {
  const translate = useTranslate();

  const lintErrors = useAtomValue(lintErrorsAtom);

  return (
    <div className="border-t border-stone-600 bg-stone-800 pr-3 text-right font-sans text-xs tracking-wider text-stone-400">
      <span className={clsx(lintErrors > 0 && "font-semibold text-red-400")}>
        {translate("editor.lintSummary", lintErrors)}
      </span>
    </div>
  );
}
