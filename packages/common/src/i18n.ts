import dlv from "dlv";
import type { Primitive } from "type-fest";

// eslint-disable-next-line @typescript-eslint/ban-types
type PathImpl<K extends string | number, V> = V extends Primitive | Function
  ? `${K}`
  : `${K}.${Path<V>}`;

/**
 * Get all the paths of an object in dot notation
 * @example
 * Path<{ a: { b: { c: number } } }> = "a" | "a.b" | "a.b.c"
 */
type Path<T> = {
  [K in keyof T]: PathImpl<K & string, T[K]>;
}[keyof T];

/**
 * Given an object and a path, get the type of the value at that path
 * @see {@link Path}
 * @example
 * PathValue<{ a: { b: { c: number } } }, 'a.b.c'> = number
 * PathValue<{ a: { b: { c: number } } }, 'a.b'> = { c: number }
 */
type PathValue<T, P extends Path<T>> = T extends any
  ? P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K]>
        ? PathValue<T[K], R>
        : never
      : never
    : P extends keyof T
    ? T[P]
    : never
  : never;

export type BaseLocale = { [key: string]: BaseLocale | string | ((...context: any) => string) };
export type LocaleCode<Locale extends BaseLocale> = Path<Locale>;
export type LocaleContext<Locale extends BaseLocale, Code extends LocaleCode<Locale>> = PathValue<
  Locale,
  Code
> extends (...context: infer A) => string
  ? A
  : [];

export type Language = "en" | "es";

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
export function initTranlate<Locale extends BaseLocale>(locales: {
  [key in Language]: Locale;
}) {
  return function translate<Key extends LocaleCode<Locale>>(
    lang: Language,
    key: Key,
    ...context: LocaleContext<Locale, Key>
  ) {
    const value = dlv(locales, `${lang}.${key}`, null);

    if (typeof value === "function") return value(...context);
    else if (typeof value === "string") return value;
    else throw new Error(`Missing translation for key ${key}`);
  };
}
