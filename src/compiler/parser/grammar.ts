import type {
  DataDirectiveType,
  InstructionType,
  PositionRange,
  RegisterType,
} from "~/compiler/common";

export type Statement = OriginChangeStatement | DataDirectiveStatement | InstructionStatement;

export type OriginChangeStatement = {
  type: "origin-change";
  newAddress: number;
  position: PositionRange;
};

export type DataDirectiveStatement = {
  type: "data";
  directive: DataDirectiveType;
  values: DataDirectiveValue[];
  label: string | null;
  position: PositionRange;
};

export type InstructionStatement = {
  type: "instruction";
  instruction: InstructionType;
  operands: Operand[];
  label: string | null;
  position: PositionRange;
};

export type DataDirectiveValue =
  | NumberExpression
  | { type: "string"; value: string; position: PositionRange }
  | { type: "unassigned"; position: PositionRange };

export type Operand =
  | {
      type: "register";
      value: RegisterType;
      position: PositionRange;
    }
  | {
      type: "label";
      label: string;
      position: PositionRange;
    }
  | ({
      type: "address";
      size: "byte" | "word" | "auto";
      position: PositionRange;
    } & ({ mode: "indirect" } | { mode: "direct"; value: NumberExpression }))
  | {
      type: "immediate";
      value: NumberExpression;
      position: PositionRange;
    };

/**
 * A number expression is a recursive data structure that represents a number
 * that can be computed at compile time. It can be a literal number, a label
 * that is resolved to a number, or a binary or unary operation on two other
 * number expressions.
 *
 * @example
 * 1 + 2 * 3
 * OFFSET data + 2
 * -3
 * 2 * (3 + 4)
 * OFFSET data + (constant + 2) * 3
 */
export type NumberExpression =
  | { type: "number-literal"; value: number; position: PositionRange }
  | { type: "label"; value: string; offset: boolean; position: PositionRange }
  | {
      type: "unary-operation";
      right: NumberExpression;
      operator: "+" | "-";
      position: PositionRange;
    }
  | {
      type: "binary-operation";
      left: NumberExpression;
      right: NumberExpression;
      operator: "+" | "-" | "*";
      position: PositionRange;
    };
