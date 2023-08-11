import type { TupleToUnion } from "type-fest";

import getFromPath, { PathValue, TerminalPath } from "./paths";

type LocaleValue = string | ((...context: any) => string);
export type BaseLocale = { [key: string]: LocaleValue | BaseLocale };
export type LocaleCode<Locale extends BaseLocale> = TerminalPath<Locale, LocaleValue>;
export type LocaleContext<Locale extends BaseLocale, Code extends LocaleCode<Locale>> = PathValue<
  Locale,
  Code,
  LocaleValue
> extends (...context: infer A) => string
  ? A
  : [];

export const LANGUAGES = ["en", "es"] as const;

export type Language = TupleToUnion<typeof LANGUAGES>;

/**
 * Create a translate function from a set of locales.
 *
 * This is a very simple translation system, it just takes a set of locales and returns a function that
 * takes a language and a key and returns the translation.
 * It may seem a bit combursome, but that's because it works really well with TypeScript.
 *
 * Keys are dot separated, so for example, the key `a.b.c` will look for the translation in the locale
 * `locales[lang].a.b.c`.
 *
 * Also, the translation can be a function that takes some context and returns a string.
 *
 *
 * @example
 * const translate = initTranlate({
 *  en: {
 *   hello: "Hello",
 *   helloName: (name: string) => `Hello ${name}`,
 *  }
 * })
 *
 * translate("en", "hello") // "Hello"
 * translate("en", "helloName", "John") // "Hello John"
 */
export function initTranlate<Locale extends BaseLocale>(locales: Record<Language, Locale>) {
  return function translate<Key extends LocaleCode<Locale>>(
    lang: Language,
    key: Key,
    ...context: LocaleContext<Locale, Key>
  ) {
    const value = getFromPath<Locale, Key, LocaleValue>(locales[lang], key);

    if (typeof value === "function") return value(...context);
    else if (typeof value === "string") return value;
    else throw new Error(`Missing translation for key ${key}`);
  };
}
