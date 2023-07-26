import { Byte } from "@vonsim/common/byte";
import { Position } from "@vonsim/common/position";
import type { SimulatorError } from "@vonsim/simulator";
import type { ByteRegister, WordRegister } from "@vonsim/simulator/cpu";

import { highlightLine } from "@/editor/methods";
import { atom, PrimitiveAtom, SetStateAction, store, WritableAtom } from "@/lib/jotai";
import { MARAtom, MBRAtom } from "@/simulator/components/bus";
import type { SimulatorEvent } from "@/simulator/helpers";
import { finish, startDebugger } from "@/simulator/state";

type Metadata = {
  name: string;
  position: Position;
  operands: string[];
  willUse: Partial<{
    ri: boolean;
    id: boolean;
    execute: boolean;
    writeback: boolean;
  }>;
};

type Cycle =
  | { phase: "fetching"; metadata: Metadata }
  | { phase: "decoding"; metadata: Metadata }
  | { phase: "fething-operands"; metadata: Metadata }
  | { phase: "executing"; metadata: Metadata }
  | { phase: "writeback"; metadata: Metadata }
  | { phase: "interrupt"; metadata: Metadata }
  | { phase: "stopped"; error?: SimulatorError<any> };

const cycleAtom = atom<Cycle>({ phase: "stopped" });

export const aluOperationAtom = atom("ADD");

const AXAtom = atom(Byte.zero(16)); // Accumulator
const BXAtom = atom(Byte.zero(16)); // Base
const CXAtom = atom(Byte.zero(16)); // Counter
const DXAtom = atom(Byte.zero(16)); // Data
const SPAtom = atom(Byte.zero(16)); // Stack Pointer
const IPAtom = atom(Byte.zero(16)); // Instruction Pointer
const IRAtom = atom(Byte.zero(8)); // Instruction Register
const riAtom = atom(Byte.zero(16)); // Register Index
const idAtom = atom(Byte.zero(16)); // Immediate Register
const leftAtom = atom(Byte.zero(16)); // Left operand for ALU
const rightAtom = atom(Byte.zero(16)); // Right operand for ALU
const resultAtom = atom(Byte.zero(16)); // Result of ALU
const FLAGSAtom = atom(Byte.zero(16)); // Flags

const lowAtom = (
  primitive: PrimitiveAtom<Byte<16>>,
): WritableAtom<Byte<8>, [SetStateAction<Byte<8>>], void> =>
  atom(
    get => get(primitive).low,
    (get, set, update) => {
      const value = get(primitive);
      const low = typeof update === "function" ? update(value.low) : update;
      set(primitive, value.withLow(low));
    },
  );

const highAtom = (
  primitive: PrimitiveAtom<Byte<16>>,
): WritableAtom<Byte<8>, [SetStateAction<Byte<8>>], void> =>
  atom(
    get => get(primitive).high,
    (get, set, update) => {
      const value = get(primitive);
      const high = typeof update === "function" ? update(value.high) : update;
      set(primitive, value.withHigh(high));
    },
  );

type RegistersMap = Record<ByteRegister, WritableAtom<Byte<8>, [SetStateAction<Byte<8>>], void>> &
  Record<WordRegister, WritableAtom<Byte<16>, [SetStateAction<Byte<16>>], void>>;

export const registers: RegistersMap = {
  AX: AXAtom,
  AL: lowAtom(AXAtom),
  AH: highAtom(AXAtom),
  BX: BXAtom,
  BL: lowAtom(BXAtom),
  BH: highAtom(BXAtom),
  CX: CXAtom,
  CL: lowAtom(CXAtom),
  CH: highAtom(CXAtom),
  DX: DXAtom,
  DL: lowAtom(DXAtom),
  DH: highAtom(DXAtom),
  SP: SPAtom,
  "SP.l": lowAtom(SPAtom),
  "SP.h": highAtom(SPAtom),
  IP: IPAtom,
  "IP.l": lowAtom(IPAtom),
  "IP.h": highAtom(IPAtom),
  IR: IRAtom,
  ri: riAtom,
  "ri.l": lowAtom(riAtom),
  "ri.h": highAtom(riAtom),
  id: idAtom,
  "id.l": lowAtom(idAtom),
  "id.h": highAtom(idAtom),
  left: leftAtom,
  "left.l": lowAtom(leftAtom),
  "left.h": highAtom(leftAtom),
  right: rightAtom,
  "right.l": lowAtom(rightAtom),
  "right.h": highAtom(rightAtom),
  result: resultAtom,
  "result.l": lowAtom(resultAtom),
  "result.h": highAtom(resultAtom),
  FLAGS: FLAGSAtom,
  "FLAGS.l": lowAtom(FLAGSAtom),
  "FLAGS.h": highAtom(FLAGSAtom),
};

export const flagsAtom = atom(get => {
  const flags = get(FLAGSAtom);
  return {
    carry: flags.bit(0),
    zero: flags.bit(6),
    sign: flags.bit(7),
    interrupts: flags.bit(9),
    overflow: flags.bit(11),
  };
});

export function handleCPUEvent(event: SimulatorEvent<"cpu:">): void {
  switch (event.type) {
    case "cpu:alu.execute": {
      store.set(aluOperationAtom, event.operation);
      store.set(FLAGSAtom, event.flags);
      store.set(resultAtom, event.result);
      return;
    }

    case "cpu:cycle.end":
      return;

    case "cpu:cycle.interrupt": {
      store.set(cycleAtom, prev => {
        if (prev.phase === "stopped") return prev;
        return { ...prev, phase: "interrupt" };
      });
      return;
    }

    case "cpu:cycle.start": {
      highlightLine(event.instruction.position.start);
      store.set(cycleAtom, { phase: "fetching", metadata: event.instruction });
      return;
    }

    case "cpu:cycle.update": {
      store.set(cycleAtom, prev => {
        if (prev.phase === "stopped") return prev;
        return {
          ...prev,
          phase:
            event.phase === "decoded"
              ? "decoding"
              : event.phase === "execute"
              ? "executing"
              : "writeback",
        };
      });
      return;
    }

    case "cpu:decode":
      return;

    case "cpu:error": {
      store.set(cycleAtom, { phase: "stopped", error: event.error });
      finish(event.error);
      return;
    }

    case "cpu:halt":
    case "cpu:int.0": {
      store.set(cycleAtom, { phase: "stopped" });
      finish();
      return;
    }

    case "cpu:int.3": {
      startDebugger();
      return;
    }

    case "cpu:int.6":
      return;

    case "cpu:int.7":
      return;

    case "cpu:inta.off":
      return;

    case "cpu:inta.on":
      return;

    case "cpu:mar.set": {
      store.set(MARAtom, store.get(registers[event.register]));
      return;
    }

    case "cpu:mbr.get": {
      store.set(registers[event.register], store.get(MBRAtom));
      return;
    }

    case "cpu:mbr.set": {
      store.set(MBRAtom, store.get(registers[event.register]));
      return;
    }

    case "cpu:register.copy": {
      // @ts-expect-error Registers types always match, see CPUMicroOperation
      store.set(registers[event.dest], store.get(registers[event.src]));
      return;
    }

    case "cpu:register.update": {
      // @ts-expect-error The value type and the register type always match, see CPUMicroOperation
      store.set(registers[event.register], event.value);
      return;
    }

    default: {
      const _exhaustiveCheck: never = event;
      return _exhaustiveCheck;
    }
  }
}
