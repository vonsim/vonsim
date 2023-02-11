import { match } from "ts-pattern";
import type { Primitive } from "type-fest";

import { ASCII_TABLE, MAX_SIGNED_VALUE, MAX_VALUE, Size } from "@/config";

// #=========================================================================#
// # Byte/Word                                                               #
// #=========================================================================#

export type Word = [low: number, high: number];

// Little endian

export function joinLowHigh(...[low, high]: Word): number {
  // Shift the high byte to the most significant byte and OR it with the low byte
  return (high << 8) | low;
}

export function splitLowHigh(value: number): Word {
  // Low byte - mask the least significant byte
  // High byte - shift the most significant byte to the least significant byte and mask it
  return [value & 0xff, (value >> 8) & 0xff];
}

/**
 * Returns the i-th bit as a boolean
 * @param c Control register (byte)
 * @param i Index (0 is the least significant bit and 7 is the most significant bit)
 */
export const bit = (byte: number, i: number): boolean => {
  const mask = 1 << i;
  return Boolean(byte & mask);
};

/**
 * Returns the mode of the i-th bit of the control register
 * @param c Control register (byte)
 * @param i Index (0 is the least significant bit and 7 is the most significant bit)
 */
export const pioMode = (c: number, i: number): "input" | "output" =>
  bit(c, i) ? "input" : "output";

// #=========================================================================#
// # Numbers                                                                 #
// #=========================================================================#

/**
 * @param n The byte/word (positive integer)
 * @param size Word or Byte
 * @returns The number as a signed integer.
 *
 * @example
 * binaryToSignedInt(0, "byte") // 0
 * binaryToSignedInt(127, "byte") // 127
 * binaryToSignedInt(128, "byte") // -128
 * binaryToSignedInt(255, "byte") // -1
 */
export function binaryToSignedInt(n: number, size: Size): number {
  return n > MAX_SIGNED_VALUE[size] ? n - MAX_VALUE[size] - 1 : n;
}

/**
 * @param n The number (positive or negative integer)
 * @param size Word or Byte
 * @returns The number as a byte/word.
 *
 * @example
 * signedIntToBinary(0, "byte") // 0
 * signedIntToBinary(127, "byte") // 127
 * signedIntToBinary(-128, "byte") // 128
 * signedIntToBinary(-1, "byte") // 255
 */
export function signedIntToBinary(n: number, size: Size): number {
  return n < 0 ? MAX_VALUE[size] + n + 1 : n;
}

export const randomByte = () => Math.floor(Math.random() * MAX_VALUE.byte);
export const randomWord = () => Math.floor(Math.random() * MAX_VALUE.word);

export type ByteRange = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const byteArray = <T>(map: (i: ByteRange) => T): T[] =>
  Array.from({ length: 8 }, (_, i) => map(i as ByteRange));

// #=========================================================================#
// # Render                                                                  #
// #=========================================================================#

export type MemoryRepresentation = "hex" | "bin" | "int" | "uint" | "ascii";

export function renderMemoryCell(n: number, representation: MemoryRepresentation): string {
  // n is a number between 0 and 255
  return match(representation)
    .with("hex", () => n.toString(16).padStart(2, "0").toUpperCase())
    .with("bin", () => n.toString(2).padStart(8, "0"))
    .with("int", () => binaryToSignedInt(n, "byte").toString(10)) // Ca2 or 2's complement
    .with("uint", () => n.toString(10)) // BSS or unsinged int
    .with("ascii", () => ASCII_TABLE[n] ?? "---")
    .exhaustive();
}

export function renderAddress(
  address: number,
  options: { trailingH?: boolean; size?: Size } = {},
): string {
  const { trailingH = true, size = "word" } = options;

  return (
    address
      .toString(16)
      .padStart(size === "word" ? 4 : 2, "0")
      .toUpperCase() + (trailingH ? "h" : "")
  );
}

export function renderWord(n: number): string {
  return splitLowHigh(n)
    .reverse()
    .map(n => n.toString(2).padStart(8, "0"))
    .join(" ");
}

// #=========================================================================#
// # Types                                                                   #
// #=========================================================================#

// eslint-disable-next-line @typescript-eslint/ban-types
type PathImpl<K extends string | number, V> = V extends Primitive | Function
  ? `${K}`
  : `${K}.${Path<V>}`;

/**
 * Get all the paths of an object in dot notation
 * @example
 * Path<{ a: { b: { c: number } } }> = "a" | "a.b" | "a.b.c"
 */
export type Path<T> = {
  [K in keyof T]: PathImpl<K & string, T[K]>;
}[keyof T];

/**
 * Given an object and a path, get the type of the value at that path
 * @see {@link Path}
 * @example
 * PathValue<{ a: { b: { c: number } } }, 'a.b.c'> = number
 * PathValue<{ a: { b: { c: number } } }, 'a.b'> = { c: number }
 */
export type PathValue<T, P extends Path<T>> = T extends any
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
