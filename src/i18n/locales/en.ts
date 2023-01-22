import type { Token, TokenType } from "@/compiler/lexer/tokens";
import { MAX_MEMORY_ADDRESS, MEMORY_SIZE, Size } from "@/config";
import { renderAddress } from "@/helpers";

const bits = (size: Size) => (size === "word" ? "16 bits" : "8 bits");
const numberFormat = new Intl.NumberFormat("en", { style: "decimal" }).format;

export const en = {
  compilerErrors: {
    // prettier-ignore
    "address-has-code": (address: number) => `Memory address ${renderAddress(address)} has instructions. It cannot be used as a data address.`,
    // prettier-ignore
    "address-out-of-range": (address: number) => `Memory address ${renderAddress(address)} is out of range (max memory address: ${renderAddress(MAX_MEMORY_ADDRESS)}).`,
    "cannot-accept-strings": (directive: string) => `${directive} can't accept strings.`,
    "cannot-be-indirect": "This operand can't be an indirect memory address.",
    "cannot-be-unassinged": (directive: string) => `${directive} can't be unassigned.`,
    "cannot-be-word": "This operand can't be of 16 bits.",
    "circular-reference": "Circular reference detected.",
    "destination-cannot-be-immediate": "The destination can't be an immediate value.",
    "double-memory-access": "Can't access to a memory location twice in the same instruction.",
    "empty-program": "Empty program. The program must have, at least, an END statement.",
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
    "instruction-out-of-range": (address: number) => `This instruction would be placed in address ${renderAddress(address)}, which is outside the memory range (max memory address: ${renderAddress(MAX_MEMORY_ADDRESS)}).`,
    "invalid-interrupt": (interrupt: number) => `Invalid interrupt number ${interrupt}.`,
    "label-not-found": (label: string) => `Label "${label}" has not been defined.`,
    // prettier-ignore
    "label-should-be-a-number": (label: string) => `Label ${label} should point to a EQU declaration or to a instruction. Maybe you ment to write OFFSET ${label}.`,
    // prettier-ignore
    "label-should-be-an-instruction": (label: string) => `Label ${label} should point to a instruction.`,
    // prettier-ignore
    "label-should-be-writable": (label: string) => `Label ${label} doesn't point to a writable memory address — should point to a DB or DW declaration.`,
    "missing-org": "No ORG before this instruction — cannot determine its location in memory.",
    "must-have-a-label": (directive: string) => `${directive} must have a label.`,
    // prettier-ignore
    "must-have-one-or-more-values": (directive: string) => `${directive} must have at least one value.`,
    "must-have-one-value": (directive: string) => `${directive} must have exactly one value.`,
    // prettier-ignore
    "occupied-address": (address: number) => `This instruction would be placed in address ${renderAddress(address)}, which is already occupied.`,
    "offset-only-with-data-directive": "OFFSET can only be use with data directives.",
    // prettier-ignore
    "size-mismatch": (src: Size, out: Size) => `The source (${bits(src)}) and destination (${bits(out)}) must be the same size.`,
    "unexpected-error": (err: unknown) => `Unexpected error: ${String(err)}`,
    // prettier-ignore
    "unknown-size": "Addressing an unknown memory address with an immediate operand requires specifying the type of pointer with WORD PTR or BYTE PTR before the address.",
    // prettier-ignore
    "value-out-of-range": (value: number, size: Size) => `The number ${value} cannot be represented with ${bits(size)}.`,

    lexer: {
      "invalid-binary": "Invalid binary number. It should only contain 0s and 1s.",
      "invalid-decimal": "Invalid decimal number. It should only contain digits.",
      "only-ascii": "Only ASCII character are supported for strings.",
      "unexpected-character": (char: string) => `Unexpected character "${char}".`,
      "unterminated-string": "Unterminated string.",
    },

    parser: {
      "ambiguous-unary": "Ambiguous unary expression detected. Use parentheses to disambiguate.",
      "duplicated-label": (label: string) => `Duplicated label "${label}".`,
      "end-must-be-the-last-statement": "END must be the last statement.",
      "expected-address-after-org": "Expected address after ORG.",
      "expected-argument": "Expected argument.",
      "expected-eos": "Expected end of statement.",
      "expected-identifier": (got: Token) => `Expected identifier, got ${got.type}.`,
      "expected-instruction": (got: Token) => `Expected instruction, got ${got.type}.`,
      "expected-label-after-offset": "Expected label after OFFSET.",
      // prettier-ignore
      "expected-instruction-after-label": (got: Token) => `Expected instruction after label, got ${got.type}.`,
      // prettier-ignore
      "expected-literal-after-expression": (expected: string) => `Expected "${expected}" after expression.`,
      // prettier-ignore
      "expected-literal-after-literal": (expected: string, after: string) => `Expected "${expected}" after "${after}".`,
      // prettier-ignore
      "expected-type": (expected: TokenType, got: TokenType) => `Expected ${expected}, got ${got}.`,
      "unclosed-parenthesis": "Unclosed parenthesis.",
    },
  },

  simulatorErrors: {
    // prettier-ignore
    "address-has-instruction": (address: number) => `Memory address ${renderAddress(address)} has an instruction, and cannot be read nor written.`,
    // prettier-ignore
    "address-out-of-range": (address: number) =>`Memory address ${renderAddress(address)} is out of range (max memory address: ${renderAddress(MAX_MEMORY_ADDRESS)}).`,
    "compile-error": "Compile error. Fix the errors and try again.",
    "invalid-action": "Invalid action.",
    // prettier-ignore
    "io-memory-not-implemented": (address: number) => `I/O memory address ${renderAddress(address)} has no implementation.`,
    // prettier-ignore
    "no-instruction": (address: number) => `Expected instruction at memory address ${renderAddress(address)} but none was found.`,
    "no-program": "No program loaded. Compile before running.",
    // prettier-ignore
    "reserved-interrupt": (interrupt: number) => `Interrupt ${interrupt} is reserved and cannot be used.`,
    "stack-overflow": "Stack overflow",
    "stack-underflow": "Stack underflow",
  },

  ui: {
    computer: "Computer",
    documentation: "Documentation",
    frecuency: "Frecuency",
    hertz: (hz: number) => `${numberFormat(hz)} Hz`,
    language: "Language",

    cpu: {
      name: "CPU",
      "general-registers": "General-purpose registers",
      "special-registers": "Special registers",
      alu: "ALU",
      memory: {
        name: "Memory",
        "start-address": "Start address",
        "start-address-must-be-integer": "Start address must be an integer.",
        "start-address-too-big": `Start address must be less or equal to ${renderAddress(
          MEMORY_SIZE,
        )}.`,
      },
    },

    devices: {
      internal: {
        label: "External devices",
        handshake: { name: "Handshake", data: "Data", state: "State" },
        pic: { name: "PIC", state: "State", connections: "Connections" },
        pio: {
          name: "PIO",
          data: "Data",
          config: "Configuration",
          port: (port: string) => `Port ${port}`,
        },
        timer: "Timer",
      },
      external: {
        label: "Internal devices",
        console: "Console",
        f10: { name: "F10", interrupt: "Interrupt" },
        leds: "LEDs",
        printer: { name: "Printer", buffer: "Buffer" },
        switches: "Switches",
      },

      ioRegister: (name: string, address: number) =>
        `${name} register (${renderAddress(address, { size: "byte" })})`,
    },

    editor: {
      lintSummary: (n: number) =>
        n === 0 ? "Listo para compilar" : n === 1 ? "Hay un error" : `Hay ${n} errores`,
    },

    runner: {
      action: {
        start: "Start",
        debug: "Debug",
        "run-until-halt": "Finish",
        step: "Next",
        stop: "Abort",
      },
      state: {
        running: "Running",
        paused: "Paused",
        "waiting-for-input": "Wating for key",
        stopped: "Stopped",
      },
    },

    settings: {
      memoryRepresentation: {
        label: "Representation mode",
        hex: "Hex",
        bin: "Bin",
        uint: "Unsigned",
        int: "2's complement",
        ascii: "Ascii",
      },
      memoryOnReset: {
        label: "Memoria on load",
        random: "Random",
        empty: "Empty",
        keep: "Keep",
      },
      devicesConfiguration: {
        label: "Devices",
        "switches-leds": "Switches and LEDs",
        "printer-pio": "Printer w/PIO",
        "printer-handshake": "Printer w/Handshake",
      },
    },
  },
} satisfies BaseLocale;

// Dumb locale type so I don't type and array or something like that
type BaseLocale = { [key: string]: BaseLocale | string | ((...context: any) => string) };
