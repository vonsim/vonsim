import clsx from "clsx";
import { atom, useAtomValue } from "jotai";

import { useTranslate } from "@/lib/i18n";

import { FileHandler } from "./files";
import { FontSize } from "./FontSize";

export const lintErrorsAtom = atom(0);

export function StatusBar() {
  const translate = useTranslate();

  const lintErrors = useAtomValue(lintErrorsAtom);

  return (
    <div className="border-border bg-background-1 flex items-center justify-between border-t px-3 font-sans text-xs tracking-wider text-stone-600 dark:text-stone-400">
      <FileHandler />
      <div className="border-border mx-2 flex grow items-center justify-end gap-4 border-x px-2">
        <FontSize />
      </div>
      <p
        className={clsx(
          "flex items-center gap-0.5 font-semibold",
          lintErrors > 0 ? "text-destructive" : "text-primary-1",
        )}
      >
        <span
          className={clsx(
            "size-3",
            lintErrors > 0 ? "icon-[lucide--x]" : "icon-[lucide--check-check]",
          )}
        />
        {translate("editor.lintSummary", lintErrors)}
      </p>
    </div>
  );
}
