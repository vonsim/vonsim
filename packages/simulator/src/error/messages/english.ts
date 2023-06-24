import { IOAddress, MemoryAddress, MemoryAddressLike } from "@vonsim/common/address";
import type { BaseLocale } from "@vonsim/common/i18n";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();

export const english = {
  // prettier-ignore
  "address-has-instruction": (address: MemoryAddressLike) => `Memory address ${MemoryAddress.format(address)} has an instruction, and cannot be read nor written.`,
  // prettier-ignore
  "address-out-of-range": (address: MemoryAddressLike) =>`Memory address ${MemoryAddress.format(address)} is out of range (max memory address: ${maxAddress}).`,
  "compile-error": "Compile error. Fix the errors and try again.",
  "invalid-action": "Invalid action.",
  // prettier-ignore
  "io-memory-not-implemented": (address: IOAddress) => `I/O memory address ${address} has no implementation.`,
  // prettier-ignore
  "no-instruction": (address: MemoryAddressLike) => `Expected instruction at memory address ${MemoryAddress.format(address)} but none was found.`,
  "no-program": "No program loaded. Compile before running.",
  // prettier-ignore
  "reserved-interrupt": (interrupt: number) => `Interrupt ${interrupt} is reserved and cannot be used.`,
  "stack-overflow": "Stack overflow",
  "stack-underflow": "Stack underflow",
  "unexpected-error": (err: unknown) => `Unexpected error: ${String(err)}`,
} satisfies BaseLocale;