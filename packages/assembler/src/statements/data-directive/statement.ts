import type { MemoryAddress } from "@vonsim/common/address";
import type { Position } from "@vonsim/common/position";

import type { GlobalStore } from "../../global-store";
import type { DataDirective } from "../../types";
import { Statement } from "../statement";
import type { Constant } from "./types/constant";
import type { Data } from "./types/data";
import type { DataDirectiveValue } from "./value";

/**
 * An data directive.
 *
 * ```vonsim
 * label DB "Hello, world!", 10
 * ```
 *
 * Data directives are used to reserve space in memory and initialize it with values.
 * Also, they can be constants that can be used anywhere in the program and don't take
 * up space in memory.
 *
 * There are two types of data directives:
 * - {@link Data}: reserves space
 * - {@link Constant}: doesn't reserve space
 *
 * All of them take arguments or values. These values can point to labels.
 * Because of this, we need to wait until all labels addresses and constants have been
 * computed by the {@link GlobalStore} to get the actual operand values.
 *
 * Before that, we can only get generic {@link NumberExpression}s.
 *
 * With that in mind, the flow of "assembling" an data directive is:
 * - Create the data directive with values.
 * - Validate it with `DataDirectiveStatement#validate`, getting generic {@link NumberExpression}s.
 * - {@link GlobalStore} computes the address of the data directive.
 * - With these addresses, {@link GlobalStore} can compute the addresses of the labels.
 * - We use `DataDirectiveStatement#evaluateExpressions` to get the actual operand values.
 *
 * ---
 * This class is: MUTABLE
 */
export abstract class DataDirectiveStatement extends Statement {
  readonly type = "data-directive";
  readonly label: string | null;
  protected readonly values: DataDirectiveValue[];
  #start: MemoryAddress | null = null;

  constructor(values: DataDirectiveValue[], label: string | null, position: Position) {
    super(position);
    this.values = values;
    this.label = label;
  }

  abstract readonly directive: DataDirective;
  abstract validate(): void;
  abstract evaluateExpressions(store: GlobalStore): void;

  get start(): MemoryAddress {
    if (this.#start === null) {
      throw new Error("Start not set");
    }

    return this.#start;
  }

  setStart(start: MemoryAddress) {
    if (this.#start !== null) {
      throw new Error("Start already set");
    }

    this.#start = start;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.#start ? { start: this.#start.toJSON() } : {}),
      directive: this.directive,
      label: this.label,
    };
  }
}

export type DataDirectiveStatementType = Data | Constant;
