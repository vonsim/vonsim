// prettier-ignore
const ASCII_TABLE = [
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

/**
 * Converts a character to its decimal representation.
 * @returns The decimal representation of the character, or null if the character is not in the ASCII table.
 */
export function charToDecimal(char: string): number | null {
  const idx = ASCII_TABLE.indexOf(char);
  return idx === -1 ? null : idx;
}

/**
 * Converts a decimal to its character representation.
 * @returns The character representation of the decimal, or null if the decimal is not in the ASCII table.
 */
export function decimalToChar(decimal: number): string | null {
  return ASCII_TABLE.at(decimal) ?? null;
}
