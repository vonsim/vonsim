import { initTranlate, LocaleCode, LocaleContext } from "@vonsim/common/i18n";
import { useCallback } from "react";

import { useLanguage } from "@/lib/settings";

import { english } from "./locales/english";
import { spanish } from "./locales/spanish";

export type Locale = typeof english;

export const translate = initTranlate<Locale>({
  en: english,
  es: spanish,
});

export function useTranslate() {
  const lang = useLanguage();

  return useCallback(
    <Key extends LocaleCode<Locale>>(key: Key, ...context: LocaleContext<Locale, Key>) =>
      translate(lang, key, ...context),
    [lang],
  );
}
