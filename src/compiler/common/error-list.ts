import type { Token } from "~/compiler/lexer/tokens";
import { Language, MAX_MEMORY_ADDRESS, MAX_VALUE, MIN_SIGNED_VALUE, Size } from "~/config";

export type CompilerErrorCode = keyof typeof ERROR_LIST;
export type CompilerErrorParams<Code extends CompilerErrorCode> = Parameters<
  typeof ERROR_LIST[Code]
>;
export type CompilerErrorMessages = { [key in Language]: string };

export const ERROR_LIST = {
  "address-has-code": (address: number) => ({
    en: hex`Memory address ${address} has instructions. It cannot be used as a data address.`,
  }),
  "address-out-of-range": (address: number) => ({
    en: hex`Memory address ${address} is out of range (max memory address: ${MAX_MEMORY_ADDRESS}).`,
  }),
  "cannot-accept-strings": (directive: string) => ({
    en: `${directive} can't accept strings.`,
  }),
  "cannot-be-indirect": () => ({
    en: `This operand can't be an indirect memory address.`,
  }),
  "cannot-be-unassinged": (directive: string) => ({
    en: `${directive} can't be unassigned.`,
  }),
  "cannot-be-word": () => ({
    en: `This operand can't be word-sized.`,
  }),
  "circular-reference": () => ({
    en: "Circular reference detected.",
  }),
  "destination-cannot-be-immediate": () => ({
    en: "The destination can't be an immediate value.",
  }),
  "double-memory-access": () => ({
    en: "Can't access to a memory location twice in the same instruction.",
  }),
  "duplicated-label": (label: string) => ({
    en: `Duplicated label "${label}".`,
  }),
  "empty-program": () => ({
    en: "Empty program. The program must have, at least, an END statement.",
  }),
  "end-must-be-the-last-statement": () => ({
    en: "END must be the last statement.",
  }),
  "equ-not-found": (label: string) => ({
    en: `EQU "${label}" not found.`,
  }),
  "expected-argument": () => ({ en: "Expected argument." }),
  "expects-ax": () => ({ en: "This operand should be AX or AL." }),
  "expects-dx": () => ({ en: "The only valid register is DX." }),
  "expects-immediate": () => ({ en: "This operand should be immediate." }),
  "expects-label": () => ({ en: "This operand should be a label." }),
  "expects-no-operands": () => ({ en: "This instruction doesn't expect any operands." }),
  "expects-one-operand": () => ({ en: "This instruction expects one operand." }),
  "expects-two-operands": () => ({ en: "This instruction expects two operands." }),
  "expects-word-register": () => ({
    en: "This instruction expects a word-size register as its operand.",
  }),
  "instruction-out-of-range": (address: number) => ({
    en: hex`This instruction would be placed in address ${address}, which is outside the memory range (${MAX_MEMORY_ADDRESS}).`,
  }),
  "invalid-binary": () => ({
    en: "Invalid binary number. It should only contain 0s and 1s.",
  }),
  "invalid-decimal": () => ({
    en: "Invalid decimal number. It should only contain digits.",
  }),
  "invalid-interrupt": (interrupt: number) => ({
    en: `Invalid interrupt number ${interrupt}.`,
  }),
  "label-not-found": (label: string) => ({
    en: `Label "${label}" has not been defined.`,
  }),
  "label-should-be-a-number": (label: string) => ({
    en: `Label ${label} should point to a EQU declaration or to a instruction label. Maybe you ment to write OFFSET ${label}.`,
  }),
  "label-should-be-an-instruction": (label: string) => ({
    en: `Label ${label} should point to a instruction.`,
  }),
  "label-should-be-writable": (label: string) => ({
    en: `Label ${label} doesn't point to a writable memory address — should point to a DB or DW declaration.`,
  }),
  "missing-org": () => ({
    en: "No ORG before this instruction; cannot determine its location in memory.",
  }),
  "must-have-a-label": (directive: string) => ({
    en: `${directive} must have a label.`,
  }),
  "must-have-one-or-more-values": (directive: string) => ({
    en: `${directive} must have at least one value.`,
  }),
  "must-have-one-value": (directive: string) => ({
    en: `${directive} must have exactly one value.`,
  }),
  "occupied-address": (address: number) => ({
    en: hex`This instruction would be placed in address ${address}, which is already occupied.`,
  }),
  "offset-only-with-data-directive": () => ({
    en: "OFFSET can only be use with data directives.",
  }),
  "only-ascii": () => ({
    en: "Only ASCII character are supported for string.",
  }),
  "size-mismatch": (src: Size, out: Size) => ({
    en: `The source (${src}) and destination (${out}) must be the same size.`,
  }),
  "unexpected-character": (char: string) => ({
    en: `Unexpected character "${char}".`,
  }),
  "unexpected-error": (err: unknown) => ({
    en: `Unexpected error: ${String(err)}`,
  }),
  "unexpected-token": (token: Token) => ({
    en: `Unexpected ${token.type}.`,
  }),
  "unknown-size": () => ({
    en: "Addressing an unknown memory address with an immediate operand requires specifying the type of pointer with WORD PTR or BYTE PTR before the address.",
  }),
  "unterminated-string": () => ({
    en: "Unterminated string.",
  }),
  "value-out-of-range": (value: number, size: Size) => {
    if (value >= 0) {
      return {
        en: `Value ${value} is too big for ${size} data. The maximum value is ${MAX_VALUE[size]}.`,
      };
    } else {
      return {
        en: `Value ${value} is too negative for ${size} data. The minimum value is ${MIN_SIGNED_VALUE[size]}.`,
      };
    }
  },

  /** Try not to use, unless you need some basic 'Expected X, got Y' */
  custom: (messages: CompilerErrorMessages) => messages,
} satisfies { [key: string]: (...a: any[]) => CompilerErrorMessages };

function hex(template: TemplateStringsArray, ...args: number[]) {
  let result = template.raw[0];
  for (let i = 0; i < args.length; i++) {
    result += args[i].toString(16).toUpperCase().padStart(4, "0") + "h";
    result += template.raw[i + 1];
  }
  return result;
}
