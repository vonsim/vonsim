import type { Token } from "@/compiler/lexer/tokens";
import { Language, MAX_MEMORY_ADDRESS, Size } from "@/config";
import { renderAddress } from "@/helpers";

export type CompilerErrorCode = keyof typeof ERROR_LIST;
export type CompilerErrorParams<Code extends CompilerErrorCode> = Parameters<
  (typeof ERROR_LIST)[Code]
>;
export type CompilerErrorMessages = { [key in Language]: string };

export const ERROR_LIST = {
  "address-has-code": (address: number) => ({
    en: addr`Memory address ${address} has instructions. It cannot be used as a data address.`,
    es: addr`La dirección de memoria ${address} tiene instrucciones. No se puede usar como dirección de datos.`,
  }),
  "address-out-of-range": (address: number) => ({
    en: addr`Memory address ${address} is out of range (max memory address: ${MAX_MEMORY_ADDRESS}).`,
    es: addr`La dirección de memoria ${address} está fuera de rango (dirección máxima de memoria: ${MAX_MEMORY_ADDRESS}).`,
  }),
  "cannot-accept-strings": (directive: string) => ({
    en: `${directive} can't accept strings.`,
    es: `${directive} no puede aceptar cadenas de texto.`,
  }),
  "cannot-be-indirect": () => ({
    en: "This operand can't be an indirect memory address.",
    es: "Este operando no puede ser una dirección de memoria indirecta.",
  }),
  "cannot-be-unassinged": (directive: string) => ({
    en: `${directive} can't be unassigned.`,
    es: `${directive} no puede estar sin asignar.`,
  }),
  "cannot-be-word": () => ({
    en: "This operand can't be of 16 bits.",
    es: "Este operando no puede ser de 16 bits.",
  }),
  "circular-reference": () => ({
    en: "Circular reference detected.",
    es: "Se detectó una referencia circular.",
  }),
  "destination-cannot-be-immediate": () => ({
    en: "The destination can't be an immediate value.",
    es: "El destino no puede ser un valor inmediato.",
  }),
  "double-memory-access": () => ({
    en: "Can't access to a memory location twice in the same instruction.",
    es: "No se puede acceder a una memoria dos veces en la misma instrucción.",
  }),
  "duplicated-label": (label: string) => ({
    en: `Duplicated label "${label}".`,
    es: `Etiqueta duplicada "${label}".`,
  }),
  "empty-program": () => ({
    en: "Empty program. The program must have, at least, an END statement.",
    es: "Programa vacío. El programa debe tener, al menos, una instrucción END.",
  }),
  "end-must-be-the-last-statement": () => ({
    en: "END must be the last statement.",
    es: "END debe ser la última instrucción.",
  }),
  "equ-not-found": (label: string) => ({
    en: `EQU "${label}" not found.`,
    es: `EQU "${label}" no encontrado.`,
  }),
  "expected-argument": () => ({ en: "Expected argument.", es: "Se esperaba un argumento." }),
  "expects-ax": () => ({
    en: "This operand should be AX or AL.",
    es: "Este operando debe ser AX o AL.",
  }),
  "expects-dx": () => ({
    en: "The only valid register is DX.",
    es: "El único registro válido es DX.",
  }),
  "expects-immediate": () => ({
    en: "This operand should be immediate.",
    es: "Este operando debe ser inmediato.",
  }),
  "expects-label": () => ({
    en: "This operand should be a label.",
    es: "Este operando debe ser una etiqueta.",
  }),
  "expects-no-operands": () => ({
    en: "This instruction doesn't expect any operands.",
    es: "Esta instrucción no espera ningún operando.",
  }),
  "expects-one-operand": () => ({
    en: "This instruction expects one operand.",
    es: "Esta instrucción espera un operando.",
  }),
  "expects-two-operands": () => ({
    en: "This instruction expects two operands.",
    es: "Esta instrucción espera dos operandos.",
  }),
  "expects-word-register": () => ({
    en: "This instruction expects a 16-bits register as its operand.",
    es: "Esta instrucción espera un registro de 16 bits como su operando.",
  }),
  "instruction-out-of-range": (address: number) => ({
    en: addr`This instruction would be placed in address ${address}, which is outside the memory range (${MAX_MEMORY_ADDRESS}).`,
    es: addr`Esta instrucción se colocaría en la dirección ${address}, la cual se encuentra fuera del rango de memoria (${MAX_MEMORY_ADDRESS}).`,
  }),
  "invalid-binary": () => ({
    en: "Invalid binary number. It should only contain 0s and 1s.",
    es: "Número binario inválido. Solo puede contener ceros y unos.",
  }),
  "invalid-decimal": () => ({
    en: "Invalid decimal number. It should only contain digits.",
    es: "Número decimal inválido. Solo puede contener dígitos.",
  }),
  "invalid-interrupt": (interrupt: number) => ({
    en: `Invalid interrupt number ${interrupt}.`,
    es: `${interrupt} no es un número de interrupción válido.`,
  }),
  "label-not-found": (label: string) => ({
    en: `Label "${label}" has not been defined.`,
    es: `La etiqueta "${label}" no ha sido definida.`,
  }),
  "label-should-be-a-number": (label: string) => ({
    en: `Label ${label} should point to a EQU declaration or to a instruction. Maybe you ment to write OFFSET ${label}.`,
    es: `La etiqueta ${label} debería apuntar a una constante EQU o a una instrucción. Quizás quiso escribir OFFSET ${label}.`,
  }),
  "label-should-be-an-instruction": (label: string) => ({
    en: `Label ${label} should point to a instruction.`,
    es: `La etiqueta ${label} debería apuntar a una instrucción.`,
  }),
  "label-should-be-writable": (label: string) => ({
    en: `Label ${label} doesn't point to a writable memory address — should point to a DB or DW declaration.`,
    es: `La etiqueta ${label} no apunta a una dirección de memoria modificable — debería apuntar a una declaración DB o DW.`,
  }),
  "missing-org": () => ({
    en: "No ORG before this instruction — cannot determine its location in memory.",
    es: "No hay ningún ORG antes de esta instrucción, por lo que no se puede determinar su ubicación en memoria.",
  }),
  "must-have-a-label": (directive: string) => ({
    en: `${directive} must have a label.`,
    es: `${directive} debe tener una etiqueta.`,
  }),
  "must-have-one-or-more-values": (directive: string) => ({
    en: `${directive} must have at least one value.`,
    es: `${directive} debe tener al menos un valor.`,
  }),
  "must-have-one-value": (directive: string) => ({
    en: `${directive} must have exactly one value.`,
    es: `${directive} debe tener exactamente un valor.`,
  }),
  "occupied-address": (address: number) => ({
    en: addr`This instruction would be placed in address ${address}, which is already occupied.`,
    es: addr`Esta instrucción sería colocada en la dirección ${address}, la cual ya está ocupada.`,
  }),
  "offset-only-with-data-directive": () => ({
    en: "OFFSET can only be use with data directives.",
    es: "OFFSET solo puede ser usado con variables.",
  }),
  "only-ascii": () => ({
    en: "Only ASCII character are supported for strings.",
    es: "Solo se soportan caracteres ASCII para cadenas de texto.",
  }),
  "size-mismatch": (src: Size, out: Size) => ({
    en: `The source (${bits(src)}) and destination (${bits(out)}) must be the same size.`,
    es: `La fuente (${bits(src)}) y el destino (${bits(out)}) deben ser del mismo tamaño.`,
  }),
  "unexpected-character": (char: string) => ({
    en: `Unexpected character "${char}".`,
    es: `Carácter inesperado "${char}".`,
  }),
  "unexpected-error": (err: unknown) => ({
    en: `Unexpected error: ${String(err)}`,
    es: `Error inesperado: ${String(err)}`,
  }),
  "unexpected-token": (token: Token) => ({
    en: `Unexpected token: ${token.type}.`,
    es: `Token inesperado: ${token.type}.`,
  }),
  "unknown-size": () => ({
    en: "Addressing an unknown memory address with an immediate operand requires specifying the type of pointer with WORD PTR or BYTE PTR before the address.",
    es: "Acceder a una dirección de memoria desconocida con un operando inmediato requiere especificar el tipo de puntero con WORD PTR o BYTE PTR antes de la dirección.",
  }),
  "unterminated-string": () => ({
    en: "Unterminated string.",
    es: "Cadena sin terminar.",
  }),
  "value-out-of-range": (value: number, size: Size) => ({
    en: `The number ${value} cannot be represented with ${bits(size)}.`,
    es: `El número ${value} no puede ser representado con ${bits(size)}.`,
  }),

  /** Try not to use, unless you need some basic 'Expected X, got Y' */
  custom: (messages: CompilerErrorMessages) => messages,
} satisfies { [key: string]: (...a: any[]) => CompilerErrorMessages };

function addr(template: TemplateStringsArray, ...args: number[]) {
  let result = template.raw[0];
  for (let i = 0; i < args.length; i++) {
    result += renderAddress(args[i]);
    result += template.raw[i + 1];
  }
  return result;
}

function bits(size: Size) {
  return size === "byte" ? "8 bits" : "16 bits";
}
