import { initTranlate } from "@vonsim/common/i18n";

import { english } from "./locales/english";
import { spanish } from "./locales/spanish";

export type Locale = typeof english;

export const translate = initTranlate<Locale>({
  en: english,
  es: spanish,
});
