import { beforeEach } from "vitest";

import { useSimulator } from "@/simulator";

export const simulator = () => useSimulator.getState();

const initialState = simulator();

beforeEach(() => {
  useSimulator.setState(initialState, true);
});
