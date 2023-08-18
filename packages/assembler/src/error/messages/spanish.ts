import { IOAddress, MemoryAddress } from "@vonsim/common/address";

import type { Messages } from "..";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();
const maxIOAddress = IOAddress.from(IOAddress.MAX_ADDRESS).toString();

export const spanish: Messages = {
  // prettier-ignore
  "address-has-code": address => `La dirección de memoria ${MemoryAddress.format(address)} tiene instrucciones. No se puede usar como dirección de datos.`,
  // prettier-ignore
  "address-out-of-range": address => `La dirección de memoria ${MemoryAddress.format(address)} está fuera de rango (dirección máxima de memoria: ${maxAddress}).`,
  "cannot-accept-strings": directive => `${directive} no puede aceptar cadenas de texto.`,
  "cannot-be-indirect": "Este operando no puede ser una dirección de memoria indirecta.",
  "cannot-be-unassinged": directive => `${directive} no puede estar sin asignar.`,
  "cannot-be-word": "Este operando no puede ser de 16 bits.",
  "circular-reference": "Se detectó una referencia circular.",
  "constant-must-have-a-label": "La constante debe tener una etiqueta.",
  "constant-must-have-one-value": "La constante debe tener una exactamente un valor.",
  "destination-cannot-be-immediate": "El destino no puede ser un valor inmediato.",
  "double-memory-access": "No se puede acceder a una memoria dos veces en la misma instrucción.",
  "duplicated-label": label => `Etiqueta duplicada "${label}".`,
  "empty-program": "Programa vacío. El programa debe tener, al menos, una instrucción END.",
  "end-must-be-the-last-statement": "END debe ser la última instrucción.",
  "equ-not-found": label => `EQU "${label}" no encontrado.`,
  "expects-ax": "Este operando debe ser AX o AL.",
  "expects-dx": "El único registro válido es DX.",
  "expects-immediate": "Este operando debe ser inmediato.",
  "expects-label": "Este operando debe ser una etiqueta.",
  "expects-no-operands": "Esta instrucción no espera ningún operando.",
  "expects-one-operand": "Esta instrucción espera un operando.",
  "expects-two-operands": "Esta instrucción espera dos operandos.",
  "expects-word-register": "Esta instrucción espera un registro de 16 bits como su operando.",
  // prettier-ignore
  "instruction-out-of-range": address => `Esta instrucción se colocaría en la dirección ${MemoryAddress.format(address)}, la cual se encuentra fuera del rango de memoria (dirección máxima de memoria: ${(maxAddress)}).`,
  "invalid-interrupt": interrupt => `${interrupt} no es un número de interrupción válido.`,
  // prettier-ignore
  "io-address-out-of-range": address => `La dirección de E/S ${address} está fuera de rango (dirección máxima de memoria E/S: ${maxIOAddress}).`,
  "label-not-found": label => `La etiqueta "${label}" no ha sido definida.`,
  // prettier-ignore
  "label-should-be-a-number": label => `La etiqueta ${label} debería apuntar a una constante EQU o a una instrucción. Quizás quiso escribir OFFSET ${label}.`,
  // prettier-ignore
  "label-should-be-an-instruction": label => `La etiqueta ${label} debería apuntar a una instrucción.`,
  // prettier-ignore
  "label-should-be-writable": label => `La etiqueta ${label} no apunta a una dirección de memoria modificable — debería apuntar a una declaración DB o DW.`,
  // prettier-ignore
  "missing-org": "No hay ningún ORG antes de esta instrucción, por lo que no se puede determinar su ubicación en memoria.",
  "must-have-one-or-more-values": directive => `${directive} debe tener al menos un valor.`,
  // prettier-ignore
  "occupied-address": address => `Esta instrucción sería colocada en la dirección ${MemoryAddress.format(address)}, la cual ya está ocupada.`,
  "offset-only-with-data-directive": "OFFSET solo puede ser usado con variables.",
  // prettier-ignore
  "size-mismatch": (src, out) => `La fuente (${src} bits) y el destino (${out} bits) deben ser del mismo tamaño.`,
  "unexpected-error": err => `Error inesperado: ${String(err)}`,
  // prettier-ignore
  "unknown-size": "Acceder a una dirección de memoria desconocida con un operando inmediato requiere especificar el tipo de puntero con WORD PTR o BYTE PTR antes de la dirección.",
  // prettier-ignore
  "value-out-of-range": (value, size) => `El número ${value} no puede ser representado con ${size} bits.`,

  lexer: {
    "invalid-binary": "Número binario inválido. Solo puede contener ceros y unos.",
    "invalid-decimal": "Número decimal inválido. Solo puede contener dígitos.",
    "only-ascii": "Solo se soportan caracteres ASCII para cadenas de texto.",
    "unexpected-character": char => `Carácter inesperado "${char}".`,
    "unterminated-string": "Cadena sin terminar.",
  },

  parser: {
    // prettier-ignore
    "ambiguous-unary": "Se detectó una expresión unaria ambigua. Use paréntesis para evitar ambigüedades.",
    "expected-address-after-org": "Se esperaba una dirección después de ORG.",
    "expected-argument": "Se esperaba un argumento.",
    "expected-eos": "Se esperaba que la instrucción termine.",
    "expected-instruction": got => `Se esperaba una instrucción, se obtuvo ${got.type}.`,
    "expected-label-after-offset": "Se esperaba una etiqueta después de OFFSET.",
    // prettier-ignore
    "expected-instruction-after-label": got => `Se esperaba una instrucción después de la etiqueta, se obtuvo ${got.type}.`,
    // prettier-ignore
    "expected-literal-after-expression": expected => `Se esperaba "${expected}" después de la expresión.`,
    // prettier-ignore
    "expected-literal-after-literal": (expected, after) => `Se esperaba "${expected}" después de "${after}".`,
    "expected-type": (expected, got) => `Se esperaba ${expected}, se obtuvo ${got}.`,
    // prettier-ignore
    "indirect-addressing-must-be-bx": "El único registro válido para el direccionamiento indirecto es BX.",
    "unclosed-parenthesis": "Paréntesis sin cerrar.",
    // prettier-ignore
    "unexpected-identifier": "Identificador inesperado. Tal vez te olvidaste agregar dos puntos (:) para hacerlo una etiqueta.",
  },
};
