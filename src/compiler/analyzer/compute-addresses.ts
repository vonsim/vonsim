import { isMatching } from "ts-pattern";
import { CompilerError, safeForEach } from "~/compiler/common";
import { instructionPattern } from "~/compiler/common/patterns";
import { MAX_MEMORY_ADDRESS } from "~/config";
import type { ValidatedStatement } from "./validate";

export type LabelAddresses = Map<string, { type: "DB" | "DW" | "instruction"; address: number }>;
export type ReadonlyMemory = Set<number>;

type ComputeAddressesResult =
  | { success: true; readonlyMemory: ReadonlyMemory; labelAddresses: LabelAddresses }
  | { success: false; errors: unknown[] };

export function computeAddresses(statements: ValidatedStatement[]): ComputeAddressesResult {
  const occupiedMemory = new Set<number>();
  const readonlyMemory: ReadonlyMemory = new Set();
  const labelAddresses: LabelAddresses = new Map();

  let pointer: number | null = null;
  const result = safeForEach(statements, statement => {
    if (statement.type === "EQU") return;
    if (statement.type === "end") return;

    if (statement.type === "origin-change") {
      pointer = statement.newAddress;
      return;
    } else if (pointer === null) {
      throw new CompilerError("missing-org", ...statement.meta.position);
    }

    if (statement.meta.label) {
      labelAddresses.set(statement.meta.label, {
        type: statement.type === "DB" || statement.type === "DW" ? statement.type : "instruction",
        address: pointer,
      });
    }

    statement.meta.start = pointer;

    const finalPointer = pointer + statement.meta.length;
    if (finalPointer > MAX_MEMORY_ADDRESS) {
      throw new CompilerError("instruction-out-of-range", ...statement.meta.position, finalPointer);
    }

    const isInstruction = isMatching(instructionPattern, statement.type);
    for (; pointer < finalPointer; pointer++) {
      if (occupiedMemory.has(pointer)) {
        throw new CompilerError("occupied-address", ...statement.meta.position, pointer);
      }

      occupiedMemory.add(pointer);
      if (isInstruction) readonlyMemory.add(pointer);
    }
  });

  if (result.success) return { success: true, readonlyMemory, labelAddresses };
  else return result;
}
