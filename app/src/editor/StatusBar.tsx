import clsx from "clsx";
import { atom, useAtomValue } from "jotai";

import { useTranslate } from "@/lib/i18n";

import { FileHandler } from "./files";

export const lintErrorsAtom = atom(0);

export function StatusBar() {
  const translate = useTranslate();

  const lintErrors = useAtomValue(lintErrorsAtom);

  return (
    <div className="border-border bg-background-1 flex items-center justify-between border-t px-3 font-sans text-xs tracking-wider text-stone-600 dark:text-stone-400">
      <FileHandler />
      <span className={clsx(lintErrors > 0 && "text-destructive font-semibold")}>
        {translate("editor.lintSummary", lintErrors)}
      </span>
    </div>
  );
}
