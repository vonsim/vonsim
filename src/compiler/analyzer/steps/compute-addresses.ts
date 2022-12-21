import { isMatching } from "ts-pattern";
import { CompilerError, hex, safeForEach } from "~/compiler/common";
import { dataDirectivePattern } from "~/compiler/common/patterns";
import { MAX_MEMORY_ADDRESS } from "../consts";
import type { ValidatedStatement } from "./validate";

export type LabelAddresses = Map<string, number>;
export type WritableMemory = Set<number>;

type ComputeAddressesResult =
  | { success: true; writableMemory: WritableMemory; labelAddresses: LabelAddresses }
  | { success: false; errors: unknown[] };

export function computeAddresses(statements: ValidatedStatement[]): ComputeAddressesResult {
  const occupiedMemory = new Set<number>();
  const writableMemory: WritableMemory = new Set();
  const labelAddresses: LabelAddresses = new Map();

  let pointer: number | null = null;
  const result = safeForEach(statements, statement => {
    if (statement.type === "EQU") return;

    if (statement.type === "origin-change") {
      pointer = statement.newAddress;
      return;
    } else if (pointer === null) {
      throw new CompilerError(
        "No ORG before this instruction; cannot determine its location in memory.",
        ...statement.meta.position,
      );
    }

    if (statement.meta.label) {
      labelAddresses.set(statement.meta.label, pointer);
    }

    statement.meta.start = pointer;

    const finalPointer = pointer + statement.meta.length;
    if (finalPointer > MAX_MEMORY_ADDRESS) {
      throw new CompilerError(
        `This instruction would be placed in address ${hex(
          finalPointer,
        )}, which is outside the memory range (${hex(MAX_MEMORY_ADDRESS)}).`,
        ...statement.meta.position,
      );
    }

    for (; pointer < finalPointer; pointer++) {
      if (occupiedMemory.has(pointer)) {
        throw new CompilerError(
          `This instruction would be placed in address ${hex(pointer)}, which is already occupied.`,
          ...statement.meta.position,
        );
      }

      occupiedMemory.add(pointer);
      if (isMatching(dataDirectivePattern, statement.type)) writableMemory.add(pointer);
    }
  });

  if (result.success) return { success: true, writableMemory, labelAddresses };
  else return result;
}
