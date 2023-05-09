import { compile } from "@/compiler";
import { Simulator } from "@/simulator";

export const initProgram = (program: string) => {
  const result = compile(program);
  if (!result.success) throw new Error("Compilation failed");

  const simulator = new Simulator();

  simulator.switchDevices("switches-and-leds");
  simulator.loadProgram({
    program: result,
    memory: { mode: "randomize" },
    cpu: { speed: 1000 }, // 1kHz, so simulator.run(1) will run 1 instruction
    devices: { printerSpeed: 1 },
  });

  return simulator;
};
