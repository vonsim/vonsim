import dlv from "dlv";

import type { Language } from "@/config";
import type { Path, PathValue } from "@/helpers";
import { useSettings } from "@/ui/settings";

import { en } from "./locales/en";
import { es } from "./locales/es";

export type Locale = typeof en;

type LocalePath = Path<Locale>;

type LocaleKeyContext<Key extends LocalePath> = PathValue<Locale, Key> extends (
  ...a: infer A
) => string
  ? A
  : [];

const locales = { en, es } satisfies { [key in Language]: Locale };

export function translate<Key extends LocalePath>(
  lang: Language,
  key: Key,
  ...context: LocaleKeyContext<Key>
): string {
  const value = dlv(locales, `${lang}.${key}`, null);

  if (typeof value === "function") return value(...context);
  else if (typeof value === "string") return value;
  else throw new Error(`Missing translation for key ${key}`);
}

export function useTranslate() {
  const lang = useSettings(state => state.language);

  return <Key extends LocalePath>(key: Key, ...args: LocaleKeyContext<Key>) =>
    translate(lang, key, ...args);
}
