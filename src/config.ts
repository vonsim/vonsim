import type { TupleToUnion } from "type-fest";

export const SIZES = ["byte", "word"] as const;
export const INTERRUPTS = [0, 3, 6, 7] as const;
export const LANGUAGES = ["en", "es"] as const;

export type Size = TupleToUnion<typeof SIZES>;
export type Interrupt = TupleToUnion<typeof INTERRUPTS>;
export type Language = TupleToUnion<typeof LANGUAGES>;

export const MAX_VALUE: { [key in Size]: number } = { byte: 0xff, word: 0xffff };
export const MAX_SIGNED_VALUE: { [key in Size]: number } = { byte: 0x7f, word: 0x7fff };
export const MIN_SIGNED_VALUE: { [key in Size]: number } = { byte: -0x80, word: -0x8000 };

export const MEMORY_SIZE = 0x4000;
export const MAX_MEMORY_ADDRESS = MEMORY_SIZE - 1;
export const MIN_MEMORY_ADDRESS = 0;
export const INITIAL_IP = 0x2000;
export const INTERRUPT_VECTOR_ADDRESS_SIZE = 4; // for historical reasons, the interrupt vector address is 4 bytes
export const PRINTER_BUFFER_SIZE = 5;

// prettier-ignore
export const ASCII_TABLE = [
  // https://www.unicode.org/charts/PDF/U0000.pdf
  "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS", "HT", "LF", "VT", "FF", "CR", "SO", "SI",
  "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US",
  "SPACE", "!", '"', "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?",
  "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
  "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_",
  "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
  "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", "DEL",
  // https://www.unicode.org/charts/PDF/U0080.pdf
  "XXX", "XXX", "BPH", "NBH", "IND", "NEL", "SSA", "ESA", "HTS", "HTJ", "VTS", "PLD", "PLU", "RI", "SS2", "SS3",
  "DCS", "PU1", "PU2", "STS", "CCH", "MW", "SPA", "EPA", "SOS", "XXX", "SCI", "CSI", "ST", "OSC", "PM", "APC",
  "NBSP", "¡", "¢", "£", "¤", "¥", "¦", "§", "¨", "©", "ª", "«", "¬", "SHY", "®", "¯",
  "°", "±", "²", "³", "´", "µ", "¶", "·", "¸", "¹", "º", "»", "¼", "½", "¾", "¿",
  "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï",
  "Ð", "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "×", "Ø", "Ù", "Ú", "Û", "Ü", "Ý", "Þ", "ß",
  "à", "á", "â", "ã", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï",
  "ð", "ñ", "ò", "ó", "ô", "õ", "ö", "÷", "ø", "ù", "ú", "û", "ü", "ý", "þ", "ÿ",
];
