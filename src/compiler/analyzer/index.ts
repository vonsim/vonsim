import { klona } from "klona/json";
import { hex, safeMap } from "~/compiler/common";
import type { Statement } from "~/compiler/parser/grammar";
import { INITIAL_IP } from "./consts";
import { compactLabels } from "./steps/compact-labels";
import { computeAddresses } from "./steps/compute-addresses";
import { evaluateConstants, ProgramConstants } from "./steps/evaluate/constants";
import { evaluateData, ProgramData } from "./steps/evaluate/data";
import { evaluateInstruction, ProgramInstruction } from "./steps/evaluate/instruction";
import { getLabelTypes } from "./steps/get-label-types";
import {
  ValidatedConstantStatement,
  ValidatedDataStatement,
  ValidatedInstructionStatement,
  validateStatement,
} from "./steps/validate";

export type AnalysisResult =
  | {
      success: true;
      constants: ProgramConstants;
      data: ProgramData[];
      instructions: ProgramInstruction[];
    }
  | { success: false; errors: unknown[] };

export function analyze(statements: Statement[]): AnalysisResult {
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
  const { labelAddresses, writableMemory } = computedAddresses;

  // Separate the statements into different categories.
  const constantStatements: ValidatedConstantStatement[] = [];
  const dataStatements: ValidatedDataStatement[] = [];
  const instructionStatements: ValidatedInstructionStatement[] = [];

  for (const statement of validatedStatements) {
    if (statement.type === "origin-change") continue;
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
  const labelMap = compactLabels(labelTypes, labelAddresses, constants);

  // Evaluate data initial values.
  const dataResult = safeMap(dataStatements, statement => evaluateData(statement, labelMap));
  if (!dataResult.success) return dataResult;
  const data = dataResult.result;

  // Evaluate data initial values.
  const instructionsResult = safeMap(instructionStatements, statement =>
    evaluateInstruction(statement, labelMap, writableMemory),
  );
  if (!instructionsResult.success) return instructionsResult;
  const instructions = instructionsResult.result;

  // Look for initial instruction.
  const initialInstruction = instructions.find(
    instruction => instruction.meta.start === INITIAL_IP,
  );
  if (!initialInstruction) {
    throw new Error(
      `No initial instruction found. Make sure to define an instruction at address ${hex(
        INITIAL_IP,
      )}.`,
    );
  }

  return klona({ success: true, constants, data, instructions });
}
