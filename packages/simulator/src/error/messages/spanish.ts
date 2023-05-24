import { MemoryAddress } from "@vonsim/common/address";

import type { Messages } from "..";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();

export const spanish: Messages = {
  // prettier-ignore
  "address-has-instruction": address => `La dirección de memoria ${address} tiene una instrucción, y no se puede leer ni escribir.`,
  // prettier-ignore
  "address-out-of-range": address => `La dirección de memoria ${MemoryAddress.format(address)} está fuera de rango (dirección máxima de memoria: ${maxAddress}).`,
  "compile-error": "Error de compilación. Solucione los errores y vuelva a intentar.",
  "invalid-action": "Acción inválida.",
  // prettier-ignore
  "io-memory-not-implemented": address => `La dirección de memoria E/S ${address} no está implementada.`,
  // prettier-ignore
  "no-instruction": address => `Se esperaba una instrucción en la dirección de memoria ${address} pero no se encontró ninguna.`,
  "no-program": "No hay ningún programa cargado. Compilá antes de ejecutar.",
  // prettier-ignore
  "reserved-interrupt": interrupt => `La interrupción ${interrupt} está reservada y no se puede usar.`,
  "stack-overflow": "Stack overflow",
  "stack-underflow": "Stack underflow",
  "unexpected-error": err => `Error inesperado: ${String(err)}`,
};
