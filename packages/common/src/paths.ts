/**
 * @fileoverview
 * Based on the work made by the react-hook-team
 * Copyright (c) 2019 2019-present Beier(Bill) Luo, under the MIT license
 * https://github.com/react-hook-form/react-hook-form/tree/f6750e0dae1373d1a25a23cf20851eef5a27624d
 */

type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type BrowserNativeObject = Date | FileList | File;

type DefaultEndType = Primitive | BrowserNativeObject;

/**
 * Checks whether the type is any
 * See {@link https://stackoverflow.com/a/49928360/3406963}
 * @typeParam T - type which may be any
 * ```
 * IsAny<any> = true
 * IsAny<string> = false
 * ```
 */
type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Checks whether T1 can be exactly (mutually) assigned to T2
 * @typeParam T1 - type to check
 * @typeParam T2 - type to check against
 * ```
 * IsEqual<string, string> = true
 * IsEqual<'foo', 'foo'> = true
 * IsEqual<string, number> = false
 * IsEqual<string, number> = false
 * IsEqual<string, 'foo'> = false
 * IsEqual<'foo', string> = false
 * IsEqual<'foo' | 'bar', 'foo'> = boolean // 'foo' is assignable, but 'bar' is not (true | false) -> boolean
 * ```
 */
type IsEqual<T1, T2> = T1 extends T2
  ? (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2
    ? true
    : false
  : false;

/**
 * Type to query whether an array type T is a tuple type.
 * @typeParam T - type which may be an array or tuple
 * @example
 * ```
 * IsTuple<[number]> = true
 * IsTuple<number[]> = false
 * ```
 */
type IsTuple<T extends readonly any[]> = number extends T["length"] ? false : true;

/**
 * Type which can be used to index an array or tuple type.
 */
type ArrayKey = number;

/**
 * Type which given a tuple type returns its own keys, i.e. only its indices.
 * @typeParam T - tuple type
 * @example
 * ```
 * TupleKeys<[number, string]> = '0' | '1'
 * ```
 */
type TupleKeys<T extends readonly any[]> = Exclude<keyof T, keyof any[]>;

/**
 * Helper function to break apart T1 and check if any are equal to T2
 *
 * See {@link IsEqual}
 */
type AnyIsEqual<T1, T2> = T1 extends T2 ? (IsEqual<T1, T2> extends true ? true : never) : never;

/**
 * Helper type for recursively constructing paths through a type.
 * This actually constructs the strings and recurses into nested
 * object types. It stops traversing when it founds a property
 * of the type `EndType`.
 *
 * See {@link Path}
 */
type PathImpl<K extends string | number, V, EndType, TraversedTypes> = V extends EndType
  ? `${K}`
  : // Check so that we don't recurse into the same type
    // by ensuring that the types are mutually assignable
    // mutually required to avoid false positives of subtypes
    true extends AnyIsEqual<TraversedTypes, V>
    ? `${K}`
    : `${K}` | `${K}.${PathInternal<V, EndType, TraversedTypes | V>}`;

/**
 * Helper type for recursively constructing paths through a type.
 * This obscures the internal type param TraversedTypes from exported contract.
 *
 * See {@link Path}
 */
type PathInternal<T, EndType, TraversedTypes = T> = T extends readonly (infer V)[]
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: PathImpl<K & string, T[K], EndType, TraversedTypes>;
      }[TupleKeys<T>]
    : PathImpl<ArrayKey, V, EndType, TraversedTypes>
  : {
      [K in keyof T]-?: PathImpl<K & string, T[K], EndType, TraversedTypes>;
    }[keyof T];

/**
 * Type which eagerly collects all paths through a type
 * @typeParam T - type which should be introspected
 * @example
 * ```
 * Path<{foo: {bar: string}}> = 'foo' | 'foo.bar'
 * ```
 */
// We want to explode the union type and process each individually
// so assignable types don't leak onto the stack from the base.
export type Path<T, EndType = DefaultEndType> = T extends any ? PathInternal<T, EndType> : never;

/**
 * Helper type for recursively constructing paths through a type.
 * This actually constructs the strings and recurses into nested
 * object types. It stops traversing when it founds a property
 * of the type `EndType`.
 *
 * See {@link ArrayPath}
 */
type ArrayPathImpl<K extends string | number, V, EndType, TraversedTypes> = V extends EndType
  ? IsAny<V> extends true
    ? string
    : never
  : V extends readonly (infer U)[]
    ? U extends EndType
      ? IsAny<V> extends true
        ? string
        : never
      : // Check so that we don't recurse into the same type
        // by ensuring that the types are mutually assignable
        // mutually required to avoid false positives of subtypes
        true extends AnyIsEqual<TraversedTypes, V>
        ? never
        : `${K}` | `${K}.${ArrayPathInternal<V, EndType, TraversedTypes | V>}`
    : true extends AnyIsEqual<TraversedTypes, V>
      ? never
      : `${K}.${ArrayPathInternal<V, EndType, TraversedTypes | V>}`;

/**
 * Helper type for recursively constructing paths through a type.
 * This obscures the internal type param TraversedTypes from exported contract.
 *
 * See {@link ArrayPath}
 */
type ArrayPathInternal<T, EndType, TraversedTypes = T> = T extends readonly (infer V)[]
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: ArrayPathImpl<K & string, T[K], EndType, TraversedTypes>;
      }[TupleKeys<T>]
    : ArrayPathImpl<ArrayKey, V, EndType, TraversedTypes>
  : {
      [K in keyof T]-?: ArrayPathImpl<K & string, T[K], EndType, TraversedTypes>;
    }[keyof T];

/**
 * Type which eagerly collects all paths through a type which point to an array
 * type.
 * @typeParam T - type which should be introspected.
 * @example
 * ```
 * Path<{foo: {bar: string[], baz: number[]}}> = 'foo.bar' | 'foo.baz'
 * ```
 */
// We want to explode the union type and process each individually
// so assignable types don't leak onto the stack from the base.
type ArrayPath<T, EndType = DefaultEndType> = T extends any ? ArrayPathInternal<T, EndType> : never;

/**
 * Type to evaluate the type which the given path points to.
 * @typeParam T - deeply nested type which is indexed by the path
 * @typeParam P - path into the deeply nested type
 * @typeParam [EndType] - when to stop traversing
 * @example
 * ```
 * PathValue<{foo: {bar: string}}, 'foo.bar'> = string
 * PathValue<[number, string], '1'> = string
 * ```
 */
export type PathValue<
  T,
  P extends Path<T, EndType> | ArrayPath<T, EndType>,
  EndType = DefaultEndType,
> = T extends any
  ? P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K], EndType>
        ? PathValue<T[K], R, EndType>
        : never
      : K extends `${ArrayKey}`
        ? T extends readonly (infer V)[]
          ? PathValue<V, R & Path<V, EndType>, EndType>
          : never
        : never
    : P extends keyof T
      ? T[P]
      : P extends `${ArrayKey}`
        ? T extends readonly (infer V)[]
          ? V
          : never
        : never
  : never;

/**
 * Type which eagerly collects only the "terminal" paths through a type
 * @typeParam T - type which should be introspected
 * @example
 * ```
 * Path<{foo: {bar: string}}> = 'foo' | 'foo.bar'
 * TerminalPath<{foo: {bar: string}}> = 'foo.bar'
 * ```
 */
export type TerminalPath<T, EndType = DefaultEndType> = {
  [Key in Path<T, EndType>]: PathValue<T, Key, EndType> extends EndType ? Key : never;
}[Path<T, EndType>];

/**
 * Get the a deeply-nested value from an object, type-safely.
 *
 * @example
 * get({a: 1, b: 2}, 'a') // => 1
 * get({a: {b: {c: 4}}}, 'a.b.c') // => 4
 * get({a: {b: {c: 4}}}, 'a.b.d') // error
 */
export default function getFromPath<T extends object, P extends Path<T, EndType>, EndType>(
  obj: T,
  path: P,
): PathValue<T, P, EndType> {
  const keys = path.split(".");
  let result: any = obj;
  for (const key of keys) {
    if (key in result) result = result[key];
    else throw new ReferenceError(`Couldn't find path "${path}".`);
  }
  return result as PathValue<T, P, EndType>;
}
