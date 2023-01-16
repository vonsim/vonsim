import { Language, MAX_MEMORY_ADDRESS } from "@/config";
import { renderAddress } from "@/helpers";

export type SimulatorErrorCode = keyof typeof ERROR_LIST;
export type SimulatorErrorParams<Code extends SimulatorErrorCode> = Parameters<
  (typeof ERROR_LIST)[Code]
>;
export type SimulatorErrorMessages = { [key in Language]: string };

export const ERROR_LIST = {
  "address-has-instuction": (address: number) => ({
    en: addr`Memory address ${address} has an instruction, and cannot be read nor written.`,
    es: addr`La dirección de memoria ${address} tiene una instrucción, y no se puede leer ni escribir.`,
  }),
  "address-out-of-range": (address: number) => ({
    en: addr`Memory address ${address} is out of range (max memory address: ${MAX_MEMORY_ADDRESS}).`,
    es: addr`La dirección de memoria ${address} está fuera de rango (dirección máxima de memoria: ${MAX_MEMORY_ADDRESS}).`,
  }),
  "compile-error": () => ({
    en: "Compile error. Fix the errors and try again.",
    es: "Error de compilación. Solucione los errores y vuelva a intentar.",
  }),
  "io-memory-not-implemented": (address: number) => ({
    en: addr`I/O memory address ${address} has no implementation.`,
    es: addr`La dirección de memoria E/S ${address} no está implementada.`,
  }),
  "no-instruction": (address: number) => ({
    en: addr`Expected instruction at memory address ${address} but none was found.`,
    es: addr`Se esperaba una instrucción en la dirección de memoria ${address} pero no se encontró ninguna.`,
  }),
  "no-program": () => ({
    en: "No program loaded. Compile before running.",
    es: "No hay ningún programa cargado. Compilá antes de ejecutar.",
  }),
  "reserved-interrupt": (interrupt: number) => ({
    en: `Interrupt ${interrupt} is reserved and cannot be used.`,
    es: `La interrupción ${interrupt} está reservada y no se puede usar.`,
  }),
  "stack-overflow": () => ({
    en: "Stack overflow",
    es: "Stack overflow",
  }),
  "stack-underflow": () => ({
    en: "Stack underflow",
    es: "Stack underflow",
  }),
} satisfies { [key: string]: (...a: any[]) => SimulatorErrorMessages };

function addr(template: TemplateStringsArray, ...args: number[]) {
  let result = template.raw[0];
  for (let i = 0; i < args.length; i++) {
    result += renderAddress(args[i]);
    result += template.raw[i + 1];
  }
  return result;
}
