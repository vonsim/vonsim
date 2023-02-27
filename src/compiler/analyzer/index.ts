/**
 * The analyzer turns the statements into a program and catches most errors.
 *
 * It does the following:
 * 1. Reads the labels and their types. This allows us to use labels that are
 *    defined later in the program.
 * 2. Validates the statements. This catches most errors, such as invalid
 *    instructions, some invalid labels, and invalid operands. It doesn't
 *    evaluate expressions yet, since we lack some information.
 * 3. Computes the addresses of the labels. This needs to be done before
 *    evaluating expressions, because the addresses of labels can be used in
 *    those calculations.
 * 4. Evaluates the constants.
 * 5. Evaluates data directives and instructions. Finally, with all the labels
 *    with addresses assigned and all the constants evaluated, we can evaluate
 *    the expressions in the operands.
 */

import { CompilerError, safeMap } from "@/compiler/common";
import type { Statement } from "@/compiler/parser/grammar";

import { compactLabels } from "./compact-labels";
import { CodeMemory, computeAddresses } from "./compute-addresses";
import { evaluateConstants, ProgramConstants } from "./evaluate/constants";
import { evaluateData, ProgramData } from "./evaluate/data";
import { evaluateInstruction, ProgramInstruction } from "./evaluate/instruction";
import { getLabelTypes } from "./get-label-types";
import {
  ValidatedConstantStatement,
  ValidatedDataStatement,
  ValidatedInstructionStatement,
  validateStatement,
} from "./validate";

export type AnalysisResult =
  | {
      success: true;
      constants: ProgramConstants;
      data: ProgramData[];
      instructions: ProgramInstruction[];
      codeMemory: CodeMemory;
    }
  | { success: false; errors: unknown[] };

export function analyze(statements: Statement[]): AnalysisResult {
  if (statements.at(-1)?.type !== "end") {
    throw new CompilerError("empty-program");
  }

  // Get whether each label is a constant, a variable or an instruction.
  const labelTypes = getLabelTypes(statements);

  // Check that the operands are valid.
  const validationResult = safeMap(statements, statement =>
    validateStatement(statement, labelTypes),
  );

  if (!validationResult.success) return validationResult;
  const validatedStatements = validationResult.result;

  // Compute the addresses of each instruction.
  const computedAddresses = computeAddresses(validatedStatements);

  if (!computedAddresses.success) return computedAddresses;
  const { labelAddresses, codeMemory } = computedAddresses;

  // Separate the statements into different categories.
  const constantStatements: ValidatedConstantStatement[] = [];
  const dataStatements: ValidatedDataStatement[] = [];
  const instructionStatements: ValidatedInstructionStatement[] = [];

  for (const statement of validatedStatements) {
    if (statement.type === "origin-change") continue;
    if (statement.type === "end") continue;
    else if (statement.type === "EQU") constantStatements.push(statement);
    else if (statement.type === "DB" || statement.type === "DW") dataStatements.push(statement);
    else instructionStatements.push(statement);
  }

  // Evaluate constants values.
  let constants: ProgramConstants;
  try {
    constants = evaluateConstants(constantStatements, labelAddresses);
  } catch (error) {
    return { success: false, errors: [error] };
  }

  // Reorder the labels
  const labelMap = compactLabels(labelAddresses, constants);

  // Evaluate data initial values.
  const dataResult = safeMap(dataStatements, statement => evaluateData(statement, labelMap));
  if (!dataResult.success) return dataResult;
  const data = dataResult.result;

  // Evaluate data initial values.
  const instructionsResult = safeMap(instructionStatements, statement =>
    evaluateInstruction(statement, labelMap, codeMemory),
  );
  if (!instructionsResult.success) return instructionsResult;
  const instructions = instructionsResult.result;

  return structuredClone({ success: true, constants, data, instructions, codeMemory });
}
