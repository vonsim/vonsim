import { readFile } from "node:fs/promises";

import { Ok } from "rust-optionals";
import { expect, it } from "vitest";

import { initProgram, simulator } from "./_simulator";

const runFixture = async (filename: string) => {
  const path = new URL(`../fixtures/${filename}.asm`, import.meta.url);
  const program = await readFile(path, { encoding: "utf-8" });
  initProgram(program);

  let count = 0;
  let result = "continue";
  while (result === "continue" && count < 1000) {
    result = simulator().executeInstruction().unwrap();
    count++;
  }
  if (count === 1000) throw new Error("Test took too long to run");
};

it("Fibonacci", async () => {
  await runFixture("fibonacci");

  expect(simulator().getMemory(0x1000, "byte")).toStrictEqual(Ok(1));
  expect(simulator().getMemory(0x1001, "byte")).toStrictEqual(Ok(1));
  expect(simulator().getMemory(0x1002, "byte")).toStrictEqual(Ok(2));
  expect(simulator().getMemory(0x1003, "byte")).toStrictEqual(Ok(3));
  expect(simulator().getMemory(0x1004, "byte")).toStrictEqual(Ok(5));
  expect(simulator().getMemory(0x1005, "byte")).toStrictEqual(Ok(8));
  expect(simulator().getMemory(0x1006, "byte")).toStrictEqual(Ok(13));
  expect(simulator().getMemory(0x1007, "byte")).toStrictEqual(Ok(21));
  expect(simulator().getMemory(0x1008, "byte")).toStrictEqual(Ok(34));
  expect(simulator().getMemory(0x1009, "byte")).toStrictEqual(Ok(55));
});
