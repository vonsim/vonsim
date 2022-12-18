import { CompilerError } from "./common";
import { Scanner } from "./lexer/scanner";
import { NumberExpression, Statement } from "./parser/grammar";
import { Parser } from "./parser/parser";

export type CompileResult =
  | {
      success: true;
      result: string;
    }
  | {
      success: false;
      errors: CompilerError[];
    };

export function compile(source: string): CompileResult {
  try {
    const scanner = new Scanner(source);
    const lexed = scanner.scanTokens();

    const parser = new Parser(lexed);
    const parsed = parser.parseTokens();

    // For testing purposes, returns the statements printed as a string
    return { success: true, result: parsed.map(statementToString).join("\n") };
  } catch (error) {
    if (error instanceof CompilerError) {
      return { success: false, errors: [error] };
    } else {
      throw error;
    }
  }
}

export { CompilerError };

function statementToString(statements: Statement): string {
  if (statements.type === "origin-change") {
    return `ORG ${statements.newAddress.toString(16).toUpperCase()}h`;
  }

  let result = "";

  if (statements.label) {
    result += `${statements.label}: `;
  }

  if (statements.type === "data") {
    result += `${statements.directive} `;
    result += statements.values
      .map((value): string => {
        if (value.type === "string") {
          return `"${value.value}"`;
        }

        if (value.type === "unassigned") {
          return "?";
        }

        return numberExpressionToString(value);
      })
      .join(", ");
  } else {
    result += statements.instruction;
    if (statements.operands.length > 0) result += " ";
    result += statements.operands
      .map((operand): string => {
        if (operand.type === "register") {
          return operand.value;
        }

        if (operand.type === "memory-direct") {
          return operand.label;
        }

        if (operand.type === "memory-indirect") {
          let op = "";
          if (operand.mode !== "auto") {
            op += `${operand.mode.toUpperCase()} PTR `;
          }
          op += "[";
          if (operand.value.type === "BX") op += "BX";
          else op += numberExpressionToString(operand.value);
          op += "]";

          return op;
        }

        return numberExpressionToString(operand.value);
      })
      .join(", ");
  }

  return result;
}

function numberExpressionToString(expression: NumberExpression): string {
  if (expression.type === "number-literal") {
    return expression.value.toString(16).toUpperCase() + "h";
  }

  if (expression.type === "label") {
    if (expression.offset) return `OFFSET ${expression.value}`;
    else return expression.value;
  }

  if (expression.type === "unary-operation") {
    return `${expression.operator}(${numberExpressionToString(expression.right)})`;
  }

  return `(${numberExpressionToString(expression.left)}) ${
    expression.operator
  } (${numberExpressionToString(expression.right)})`;
}
