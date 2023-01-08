import { klona } from "klona/json";
import { safeMap } from "~/compiler/common";
import type { Statement } from "~/compiler/parser/grammar";
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
    throw new Error("Empty program. The program must have, at least, an END statement");
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

  return klona({ success: true, constants, data, instructions, codeMemory });
}
