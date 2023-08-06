import type { Byte, ByteSize } from "@vonsim/common/byte";
import type { SetStateAction, WritableAtom } from "jotai";

export type ByteAtom<TSize extends ByteSize> = WritableAtom<
  Byte<TSize>,
  [SetStateAction<Byte<TSize>>],
  void
>;

export type AnyByteAtom = ByteAtom<8> | ByteAtom<16>;
