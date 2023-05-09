import { MemoryAddress } from "@vonsim/common/address";
import { forEachWithErrors } from "@vonsim/common/loops";

import type { Constant } from "@/constant";
import type { DataDirective } from "@/data-directive";
import { CompilerError } from "@/error";
import { Instruction } from "@/instructions";
import { OriginChangeStatement, Statement } from "@/parser/statement";
import type { ConstantName, DataDirectiveName } from "@/types";

type LabelsMap = Map<
  string,
  | { type: DataDirectiveName | "instruction"; address: MemoryAddress }
  | { type: ConstantName; constant: Constant }
>;

/**
 * The Global Store™
 *
 * This class is used to store labels, constants and reserved memory.
 *
 * Since the assembler is a single-pass assembler, we can't compute the addresses of labels
 * until we have parsed the whole program. This class is used to store the labels and constants
 * until we can compute their addresses.
 *
 * Our main limitation is that we need to know the length of each instruction to compute the
 * address of each one (and hence, the address of each label).
 *
 * Why? For instance:
 *
 * ```vonsim
 * mov al, label
 * ```
 *
 * If `label` is a constant, the instruction is a MOV reg<-imd (3 bytes).
 * However, if `label` points to a DB, the instruction is a MOV reg<-mem (direct) (4 bytes).
 *
 * So, we need to know at least the type of each label to compute the addresses. This is,
 * whether it is a constant (or points to an instruction) or a DB/DW.
 *
 * That's why we have two methods: `loadStatements` and `computeAddresses`.
 *
 * The first one initializes the store: it loads the labels and constants from the statements.
 * It mainly checks for duplicated labels and stores the constants (without evaluating them).
 *
 * The second one computes the addresses of the labels and stores them in the store.
 *
 * By the end of the second method, the store is ready to be used by {@link DataDirective}
 * and {@link Instruction} to evaluate their operands.
 */
export class GlobalStore {
  private readonly codeMemory: Set<number> = new Set();
  private readonly labels: LabelsMap = new Map();

  #statementsLoaded = false;
  #computedAddresses = false;

  /**
   * Loads the label types from the given statements
   * @returns Errors that occurred while loading the label types
   */
  loadStatements(statements: Statement[]): CompilerError<any>[] {
    if (this.#statementsLoaded) {
      throw new Error("Tried to load statements twice");
    }

    this.#statementsLoaded = true;
    this.labels.clear();
    const errors: CompilerError<any>[] = [];

    for (const statement of statements) {
      if (!("label" in statement)) continue;
      if (!statement.label) continue;

      if (this.labels.has(statement.label)) {
        errors.push(new CompilerError("duplicated-label", statement.label).at(statement.position));
        continue;
      }

      if (statement.isConstant()) {
        this.labels.set(statement.label, {
          type: "EQU",
          constant: statement.toConstant(),
        });
      } else if (statement.isDataDirective()) {
        this.labels.set(statement.label, {
          type: statement.directive,
          address: MemoryAddress.from(0),
        });
      } else {
        this.labels.set(statement.label, {
          type: "instruction",
          address: MemoryAddress.from(0),
        });
      }
    }

    return errors;
  }

  computeAddresses(
    statements: (OriginChangeStatement | DataDirective | Instruction)[],
  ): CompilerError<any>[] {
    if (this.#computedAddresses) {
      throw new Error("Tried to compute addresses twice");
    }

    this.#computedAddresses = true;
    this.codeMemory.clear();
    const occupiedMemory = new Set<number>();

    let pointer: number | null = null;

    const errors = forEachWithErrors(
      statements,
      statement => {
        if (statement instanceof OriginChangeStatement) {
          pointer = statement.newAddress;
          return;
        }

        if (pointer === null) {
          throw new CompilerError("missing-org").at(statement);
        }

        const length = statement.length;
        const isInstruction = statement instanceof Instruction;

        for (let i = 0; i < length; i++) {
          if (!MemoryAddress.inRange(pointer, i)) {
            throw new CompilerError("instruction-out-of-range", pointer).at(statement);
          }
          const address = MemoryAddress.from(pointer, i);

          if (occupiedMemory.has(address.value)) {
            throw new CompilerError("occupied-address", address).at(statement);
          }

          occupiedMemory.add(address.value);
          if (isInstruction) this.codeMemory.add(address.value);
        }

        const startAddress = MemoryAddress.from(pointer);
        statement.setStart(startAddress);
        if (statement.label) {
          this.labels.set(statement.label, {
            type: isInstruction ? "instruction" : statement.directive,
            address: startAddress,
          });
        }

        pointer += length;
      },
      CompilerError.from,
    );

    return errors;
  }

  /**
   * @returns Whether the label is defined.
   */
  labelExists(label: string) {
    if (!this.#statementsLoaded) {
      throw new Error("Tried to check if label exists before loading statements");
    }

    return this.labels.has(label);
  }

  /**
   * @returns What the label points to.
   */
  getLabelType(label: string) {
    if (!this.#statementsLoaded) {
      throw new Error("Tried to get type of label before loading statements");
    }

    return this.labels.get(label)?.type;
  }

  /**
   * @returns The value of the label.
   *          If the label is a constant, this is the value of the constant.
   *          Otherwise, this is the address of the data or instruction.
   */
  getLabelValue(label: string) {
    if (!this.#statementsLoaded) {
      throw new Error("Tried to get type of label before loading statements");
    }

    const data = this.labels.get(label);
    if (!data) return undefined;

    if (data.type === "EQU") {
      return data.constant.evaluate(this);
    } else {
      if (!this.#computedAddresses) {
        throw new Error("Tried to get address of label before computing addresses");
      }

      return data.address.value;
    }
  }

  /**
   * Tells whether the given address is reserved by an instruction.
   * @returns Whether the given address is reserved.
   */
  addressIsReserved(address: MemoryAddress | number): boolean {
    if (address instanceof MemoryAddress) address = address.value;
    return this.codeMemory.has(address);
  }
}
