import type { TupleToUnion } from "type-fest";

export const SIZES = ["byte", "word"] as const;
export const INTERRUPTS = [0, 3, 6, 7] as const;
export const LANGUAGES = ["en", "es"] as const;

export type Size = TupleToUnion<typeof SIZES>;
export type Interrupt = TupleToUnion<typeof INTERRUPTS>;
export type Language = TupleToUnion<typeof LANGUAGES>;

export const MAX_VALUE: { [key in Size]: number } = { byte: 0xff, word: 0xffff };
export const MAX_SIGNED_VALUE: { [key in Size]: number } = { byte: 0x7f, word: 0x7fff };
export const MIN_SIGNED_VALUE: { [key in Size]: number } = { byte: -0x80, word: -0x8000 };

export const MEMORY_SIZE = 0x4000;
export const MAX_MEMORY_ADDRESS = MEMORY_SIZE - 1;
export const MIN_MEMORY_ADDRESS = 0;
export const INITIAL_IP = 0x2000;
