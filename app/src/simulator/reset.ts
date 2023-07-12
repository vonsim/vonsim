import { Byte } from "@vonsim/common/byte";
import type { Simulator } from "@vonsim/simulator";

import { store } from "@/lib/jotai";
import { registers } from "@/simulator/components/cpu";
import { DATAAtom, STATEAtom } from "@/simulator/components/handshake";
import { ledsAtom } from "@/simulator/components/leds";
import { memoryAtom } from "@/simulator/components/memory";
import { IMRAtom, IRRAtom, ISRAtom, linesAtom } from "@/simulator/components/pic";
import { CAAtom, CBAtom, PAAtom, PBAtom } from "@/simulator/components/pio";
import { bufferAtom, paperAtom } from "@/simulator/components/printer";
import { switchesAtom } from "@/simulator/components/switches";
import { COMPAtom, CONTAtom } from "@/simulator/components/timer";

export function resetState(simulator: Simulator) {
  const state = simulator.getComputerState()!;
  store.set(registers["AX"], Byte.fromUnsigned(state.cpu.AX, 16));
  store.set(registers["BX"], Byte.fromUnsigned(state.cpu.BX, 16));
  store.set(registers["CX"], Byte.fromUnsigned(state.cpu.CX, 16));
  store.set(registers["DX"], Byte.fromUnsigned(state.cpu.DX, 16));
  store.set(registers["SP"], Byte.fromUnsigned(state.cpu.SP, 16));
  store.set(registers["IP"], Byte.fromUnsigned(state.cpu.IP, 16));
  store.set(registers["FLAGS"], Byte.fromUnsigned(state.cpu.FLAGS, 16));
  store.set(memoryAtom, new Uint8Array(state.memory));
  store.set(IMRAtom, Byte.fromUnsigned(state.io.pic.IMR, 8));
  store.set(IRRAtom, Byte.fromUnsigned(state.io.pic.IRR, 8));
  store.set(ISRAtom, Byte.fromUnsigned(state.io.pic.ISR, 8));
  store.set(
    linesAtom,
    state.io.pic.lines.map(line => Byte.fromUnsigned(line, 8)),
  );
  store.set(CONTAtom, Byte.fromUnsigned(state.io.timer.CONT, 8));
  store.set(COMPAtom, Byte.fromUnsigned(state.io.timer.COMP, 8));

  if ("handshake" in state.io) {
    store.set(DATAAtom, Byte.fromUnsigned(state.io.handshake.DATA, 8));
    store.set(STATEAtom, Byte.fromUnsigned(state.io.handshake.STATE, 8));
  }
  if ("leds" in state.io) {
    store.set(ledsAtom, Byte.fromUnsigned(state.io.leds, 8));
  }
  if ("pio" in state.io) {
    store.set(PAAtom, Byte.fromUnsigned(state.io.pio.PA, 8));
    store.set(PBAtom, Byte.fromUnsigned(state.io.pio.PB, 8));
    store.set(CAAtom, Byte.fromUnsigned(state.io.pio.CA, 8));
    store.set(CBAtom, Byte.fromUnsigned(state.io.pio.CB, 8));
  }
  if ("printer" in state.io) {
    store.set(
      bufferAtom,
      state.io.printer.buffer.map(char => Byte.fromUnsigned(char, 8)),
    );
    store.set(paperAtom, state.io.printer.paper);
  }
  if ("switches" in state.io) {
    store.set(switchesAtom, Byte.fromUnsigned(state.io.switches, 8));
  }
}
