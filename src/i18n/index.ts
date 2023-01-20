import dlv from "dlv";

import type { Language } from "@/config";
import type { Path, PathValue } from "@/helpers";

import { en } from "./locales/en";
import { es } from "./locales/es";

export type Locale = typeof en;

const locales = { en, es } satisfies { [key in Language]: Locale };

type LocaleCode = Path<Locale>;
type LocaleContext<Code extends LocaleCode> = PathValue<Locale, Code> extends (
  ...context: infer A
) => string
  ? A
  : [];

export function translate<Key extends Path<Locale>>(
  lang: Language,
  key: Key,
  ...context: LocaleContext<Key>
): string {
  const value = dlv(locales, `${lang}.${key}`, null);

  if (typeof value === "function") return value(...context);
  else if (typeof value === "string") return value;
  else throw new Error(`Missing translation for key ${key}`);
}
