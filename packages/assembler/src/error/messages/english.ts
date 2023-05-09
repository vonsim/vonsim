import type { LiteralUnion } from "type-fest";

import type { Token, TokenType } from "@/lexer/tokens";
import { IOAddress, MemoryAddress } from "~common/address";
import { Byte, ByteSize } from "~common/byte";
import type { BaseLocale } from "~common/i18n";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS);
const maxIOAddress = IOAddress.from(IOAddress.MAX_ADDRESS);

export const english = {
  // prettier-ignore
  "address-has-code": (address: MemoryAddress) => `Memory address ${address} has instructions. It cannot be used as a data address.`,
  // prettier-ignore
  "address-out-of-range": (address: number) => `Memory address ${address} is out of range (max memory address: ${maxAddress}).`,
  "cannot-accept-strings": (directive: string) => `${directive} can't accept strings.`,
  "cannot-be-indirect": "This operand can't be an indirect memory address.",
  "cannot-be-unassinged": (directive: string) => `${directive} can't be unassigned.`,
  "cannot-be-word": "This operand can't be of 16 bits.",
  "circular-reference": "Circular reference detected.",
  "destination-cannot-be-immediate": "The destination can't be an immediate value.",
  "double-memory-access": "Can't access to a memory location twice in the same instruction.",
  "duplicated-label": (label: string) => `Duplicated label "${label}".`,
  "empty-program": "Empty program. The program must have, at least, an END statement.",
  "end-must-be-the-last-statement": "END must be the last statement.",
  "equ-not-found": (label: string) => `EQU "${label}" not found.`,
  "expects-ax": "This operand should be AX or AL.",
  "expects-dx": "The only valid register is DX.",
  "expects-immediate": "This operand should be immediate.",
  "expects-label": "This operand should be a label.",
  "expects-no-operands": "This instruction doesn't expect any operands.",
  "expects-one-operand": "This instruction expects one operand.",
  "expects-two-operands": "This instruction expects two operands.",
  "expects-word-register": "This instruction expects a 16-bits register as its operand.",
  // prettier-ignore
  "instruction-out-of-range": (address: number) => `This instruction would be placed in address ${address}, which is outside the memory range (max memory address: ${maxAddress}).`,
  "invalid-interrupt": (interrupt: number) => `Invalid interrupt number ${interrupt}.`,
  // prettier-ignore
  "io-address-out-of-range": (address: number) => `I/O address ${address} is out of range (max I/O address: ${maxIOAddress}).`,
  // prettier-ignore
  "jump-too-far": (disp: number, dispSize: ByteSize) => `This jump is too far (${disp} bytes). The maximum displacement for this instruction is ${Byte.maxSignedValue(dispSize)} bytes.`,
  "label-not-found": (label: string) => `Label "${label}" has not been defined.`,
  // prettier-ignore
  "label-should-be-a-number": (label: string) => `Label ${label} should point to a EQU declaration or to a instruction. Maybe you ment to write OFFSET ${label}.`,
  // prettier-ignore
  "label-should-be-an-instruction": (label: string) => `Label ${label} should point to a instruction.`,
  // prettier-ignore
  "label-should-be-writable": (label: string) => `Label ${label} doesn't point to a writable memory address — should point to a DB or DW declaration.`,
  "missing-org": "No ORG before this instruction — cannot determine its location in memory.",
  // prettier-ignore
  "must-have-one-or-more-values": (directive: string) => `${directive} must have at least one value.`,
  // prettier-ignore
  "occupied-address": (address: MemoryAddress) => `This instruction would be placed in address ${address}, which is already occupied.`,
  "offset-only-with-data-directive": "OFFSET can only be use with data directives.",
  // prettier-ignore
  "size-mismatch": (src: ByteSize, out: ByteSize) => `The source (${src}-bit) and destination (${out}-bit) must be the same size.`,
  "unexpected-error": (err: unknown) => `Unexpected error: ${String(err)}`,
  // prettier-ignore
  "unknown-size": "Addressing an unknown memory address with an immediate operand requires specifying the type of pointer with WORD PTR or BYTE PTR before the address.",
  // prettier-ignore
  "value-out-of-range": (value: number, size: ByteSize) => `The number ${value} cannot be represented with ${size} bits.`,

  lexer: {
    "invalid-binary": "Invalid binary number. It should only contain 0s and 1s.",
    "invalid-decimal": "Invalid decimal number. It should only contain digits.",
    "only-ascii": "Only ASCII character are supported for strings.",
    "unexpected-character": (char: string) => `Unexpected character "${char}".`,
    "unterminated-string": "Unterminated string.",
  },

  parser: {
    "ambiguous-unary": "Ambiguous unary expression detected. Use parentheses to disambiguate.",
    "expected-address-after-org": "Expected address after ORG.",
    "expected-argument": "Expected argument.",
    "expected-eos": "Expected end of statement.",
    "expected-instruction": (got: Token) => `Expected instruction, got ${got.type}.`,
    "expected-label-after-offset": "Expected label after OFFSET.",
    // prettier-ignore
    "expected-instruction-after-label": (got: Token) => `Expected instruction after label, got ${got.type}.`,
    // prettier-ignore
    "expected-literal-after-expression": (expected: string) => `Expected "${expected}" after expression.`,
    // prettier-ignore
    "expected-literal-after-literal": (expected: string, after: string) => `Expected "${expected}" after "${after}".`,
    // prettier-ignore
    "expected-type": (expected: LiteralUnion<TokenType, string>, got: TokenType) => `Expected ${expected}, got ${got}.`,
    // prettier-ignore
    "indirect-addressing-must-be-bx": "The only register supported for indirect addressing is BX.",
    "must-have-a-label": "Constant must have a label.",
    "unclosed-parenthesis": "Unclosed parenthesis.",
    // prettier-ignore
    "unexpected-identifier": "Unexpected identifier. You may have forgotten a colon (:) to make it a label.",
  },
} satisfies BaseLocale;
