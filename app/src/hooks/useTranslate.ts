import type { LocaleCode, LocaleContext } from "@vonsim/common/i18n";

import { useLanguage } from "@/hooks/useSettings";
import { Locale, translate } from "@/lib/i18n";

export function useTranslate() {
  const lang = useLanguage();

  return <Key extends LocaleCode<Locale>>(key: Key, ...context: LocaleContext<Locale, Key>) =>
    translate(lang, key, ...context);
}
