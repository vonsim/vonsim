import type { Byte, ByteSize } from "@vonsim/common/byte";
import type { SimulatorEvent as AllSimulatorEvents } from "@vonsim/simulator";
import type { SetStateAction, WritableAtom } from "jotai";

export type SimulatorEvent<Prefix extends string = ""> = AllSimulatorEvents & {
  type: `${Prefix}${string}`;
};

export type ByteAtom<TSize extends ByteSize> = WritableAtom<
  Byte<TSize>,
  [SetStateAction<Byte<TSize>>],
  void
>;

export type AnyByteAtom = ByteAtom<8> | ByteAtom<16>;
