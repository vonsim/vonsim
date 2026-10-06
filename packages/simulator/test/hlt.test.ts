import { expect, it } from "vitest";

import { run } from "./run";

it("should end the cycle of every instruction, HLT included", () => {
  const result = run(`
    org 2000h
    mov al, 1
    add al, 2
    hlt
    end
  `);
  const types = result.events.map(event => event.type);

  expect(types.filter(type => type === "cpu:cycle.start")).toHaveLength(3);
  expect(types.filter(type => type === "cpu:cycle.end")).toHaveLength(3);
  expect(types.slice(-2)).toEqual(["cpu:halt", "cpu:cycle.end"]);
});
