export const MEMORY_SIZE = 0x4000;
export const MAX_MEMORY_ADDRESS = MEMORY_SIZE - 1;
export const MIN_MEMORY_ADDRESS = 0;
export const MAX_BYTE_VALUE = 0xff;
export const MAX_WORD_VALUE = 0xffff;
export const MIN_BYTE_VALUE = -0x80;
export const MIN_WORD_VALUE = -0x8000;
export const INITIAL_IP = 0x2000;
export const INTERRUPTIONS = [0, 6, 7] as const;