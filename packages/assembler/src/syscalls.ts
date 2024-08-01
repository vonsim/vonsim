import { Byte } from "@vonsim/common/byte";

/**
 * This is a map of syscall numbers to their addresses.
 *
 * @see {@link https://vonsim.github.io/en/computer/cpu#llamadas-al-sistema}.
 */
export const syscalls = [
  [0, Byte.fromUnsigned(0xa000, 16)],
  [3, Byte.fromUnsigned(0xa300, 16)],
  [6, Byte.fromUnsigned(0xa600, 16)],
  [7, Byte.fromUnsigned(0xa700, 16)],
] as const;

export type Syscalls = typeof syscalls;
export type SyscallNumber = Syscalls[number][0];

/**
 * Set of reserved addresses for syscalls.
 * These are addresses of the interrupt vector table that point to a syscall.
 */
export const reservedAddressesForSyscalls: ReadonlySet<number> = new Set(
  ...syscalls.map(([n]) => {
    // Each element of the interrupt vector table is 4 bytes long.
    return [n * 4, n * 4 + 1, n * 4 + 2, n * 4 + 3];
  }),
);
