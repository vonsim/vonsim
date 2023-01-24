import { beforeEach } from "vitest";

import { compile } from "@/compiler";
import { useSimulator } from "@/simulator";

export const simulator = () => useSimulator.getState();

const initialState = simulator();

beforeEach(() => {
  useSimulator.setState(initialState, true);
});

export const initProgram = (program: string) => {
  const result = compile(program);
  if (!result.success) throw new Error("Compilation failed");
  simulator().loadProgram(result, {
    memoryConfig: "random",
    devicesConfiguration: "switches-leds",
  });
};
