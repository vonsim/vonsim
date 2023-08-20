import { IOAddress, IOAddressLike, MemoryAddress, MemoryAddressLike } from "@vonsim/common/address";
import type { BaseLocale } from "@vonsim/common/i18n";

const maxAddress = MemoryAddress.from(MemoryAddress.MAX_ADDRESS).toString();

export const english = {
  // prettier-ignore
  "address-has-instruction": (address: MemoryAddressLike) => `Memory address ${MemoryAddress.format(address)} has an instruction, and cannot be read nor written.`,
  // prettier-ignore
  "address-out-of-range": (address: MemoryAddressLike) =>`Memory address ${MemoryAddress.format(address)} is out of range (max memory address: ${maxAddress}).`,
  "device-not-connected": (device: string) => `"${device}" is not connected to the computer.`,
  // prettier-ignore
  "io-memory-not-connected": (address: IOAddressLike) => `Didn't found a module connected to I/O memory address ${IOAddress.format(address)}.`,
  // prettier-ignore
  "no-instruction": (address: MemoryAddressLike) => `Expected instruction at memory address ${MemoryAddress.format(address)} but none was found.`,
  "no-program": "No program loaded. Assemble before running.",
  "stack-overflow": "Stack overflow",
  "stack-underflow": "Stack underflow",
  "unexpected-error": (err: unknown) => `Unexpected error: ${String(err)}`,
} satisfies BaseLocale;
