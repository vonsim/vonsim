import { assemble } from "@vonsim/assembler";

import { Simulator, type SimulatorEvent } from "../src";

/**
 * Assembles the program and runs it until the CPU stops.
 * @returns The final state of the computer and the emitted events.
 */
export function run(source: string) {
  const result = assemble(source);
  if (!result.success) throw new Error("Expected program to assemble");

  const simulator = new Simulator();
  simulator.loadProgram({
    program: result.program,
    devices: { keyboardAndScreen: false, pic: false, pio: null, handshake: null },
    data: "clean",
  });

  const events: SimulatorEvent[] = [];
  const generator = simulator.startCPU();
  for (let event = generator.next(); !event.done; event = generator.next()) {
    events.push(event.value);
  }

  const state = simulator.getComputerState()!;
  const { FLAGS } = state.cpu;
  return {
    events,
    cpu: state.cpu,
    memory: state.memory,
    flags: {
      CF: (FLAGS & (1 << 0)) !== 0,
      ZF: (FLAGS & (1 << 6)) !== 0,
      SF: (FLAGS & (1 << 7)) !== 0,
      OF: (FLAGS & (1 << 11)) !== 0,
    },
  };
}
