import type { Token } from "@/lexer/tokens";
import { Position } from "@/position";
import type { DataDirective } from "@/types";

import type { DataDirectiveStatementType } from "./statement";
import { Constant } from "./types/constant";
import { Data } from "./types/data";
import type { DataDirectiveValue } from "./value";

export function createDataDirectiveStatement(
  token: Token & { type: DataDirective },
  values: DataDirectiveValue[],
  label: string | null,
): DataDirectiveStatementType {
  const position = Position.merge(token.position, ...values.map(val => val.position));

  switch (token.type) {
    case "DB":
    case "DW":
      return new Data(token.type, values, label, position);
    case "EQU":
      return new Constant(values, label, position);
  }
}

export type { DataDirectiveStatementType as DataDirectiveStatement };
export * from "./value";
export { Constant, Data };
