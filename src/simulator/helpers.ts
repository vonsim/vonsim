import { match } from "ts-pattern";
import { MAX_SIGNED_BYTE_VALUE, MAX_SIGNED_WORD_VALUE } from "~/config";
import type { MemoryRepresentation } from "./computer/userconfig";

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

// #=========================================================================#
// # Numbers                                                                 #
// #=========================================================================#

export function unsignedToSigned(n: number, size: "byte" | "word"): number {
  const max = size === "byte" ? MAX_SIGNED_BYTE_VALUE : MAX_SIGNED_WORD_VALUE;
  return n > max ? max - n : n;
}

export function signedToUnsigned(n: number, size: "byte" | "word"): number {
  const max = size === "byte" ? MAX_SIGNED_BYTE_VALUE : MAX_SIGNED_WORD_VALUE;
  return n < 0 ? max - n : n;
}

// #=========================================================================#
// # Other                                                                   #
// #=========================================================================#

export function renderMemoryCell(n: number, representation: MemoryRepresentation): string {
  // n is a number between 0 and 255
  return match(representation)
    .with("hex", () => n.toString(16).padStart(2, "0").toUpperCase())
    .with("bin", () => n.toString(2).padStart(8, "0"))
    .with("int", () => unsignedToSigned(n, "byte").toString(10)) // Ca2 or 2's complement
    .with("uint", () => n.toString(10)) // BSS or unsinged int
    .with("ascii", () => String.fromCharCode(n))
    .exhaustive();
}

export function renderAddress(address: number, withH = true): string {
  return address.toString(16).padStart(4, "0").toUpperCase() + (withH ? "h" : "");
}

export function renderWord(n: number): string {
  return splitLowHigh(n)
    .reverse()
    .map(n => n.toString(2).padStart(8, "0"))
    .join(" ");
}
