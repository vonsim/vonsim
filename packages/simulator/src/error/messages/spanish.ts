import { IOAddress, MemoryAddress } from "@vonsim/common/address";

import type { Messages } from "..";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();

export const spanish: Messages = {
  // prettier-ignore
  "address-has-instruction": address => `La dirección de memoria ${MemoryAddress.format(address)} tiene una instrucción, y no se puede escribir.`,
  // prettier-ignore
  "address-is-reserved": address => `La dirección de memoria ${MemoryAddress.format(address)} está reservada, y no se puede escribir.`,
  // prettier-ignore
  "address-out-of-range": address => `La dirección de memoria ${MemoryAddress.format(address)} está fuera de rango (dirección máxima de memoria: ${maxAddress}).`,
  "device-not-connected": (device: string) => `"${device}" no está conectado a la computadora.`,
  // prettier-ignore
  "io-memory-not-connected": (address)=> `No se encontró ningún módulo conectado a la dirección de memoria E/S ${IOAddress.format(address)}.`,
  // prettier-ignore
  "no-instruction": address => `Se esperaba una instrucción en la dirección de memoria ${MemoryAddress.format(address)} pero no se encontró ninguna.`,
  "no-program": "No hay ningún programa cargado. Ensamblá antes de ejecutar.",
  "stack-overflow": "Stack overflow",
  "stack-underflow": "Stack underflow",
  "unexpected-error": err => `Error inesperado: ${String(err)}`,
};
