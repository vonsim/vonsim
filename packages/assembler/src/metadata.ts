export type Metadata = Record<string, MetadataValue>;
export type MetadataValue = string | boolean | null;

/**
 * Metadata are special comments in the assembly source code that provide additional information about the program.
 * They are in the format:
 * ```asm
 * ;; key=value
 * ```
 *
 * We're a somewhat flexible about the format, allowing for whitespaces between the equals sign and the key/value.
 * Nonetheless, we require follow the following rules:
 * - Metadata comments must start with two semicolons (`;;`).
 * - Metadata comments must be on their own line.
 * - Keys are alphanumeric and can include underscores (`_`).
 * - Values can be any string, but leading and trailing whitespace is trimmed.
 * - If a key appears multiple times, the last value is used.
 *
 * Keys are always case-sensitive strings, whereas values can be interpreted as:
 * - `yes`, `true` (case-insensitive) => boolean `true`;
 * - `no`, `false` (case-insensitive) => boolean `false`;
 * - `none`, `null` or empty (case-insensitive) => `null`;
 * - anything else => string.
 *
 * @param source The assembly source code to extract metadata from.
 * @returns A record with the metadata key-value pairs.
 */
export function getMetadataFromProgram(source: string): Metadata {
  const metadata: Metadata = {};
  const lines = source.split("\n");

  const metadataRegex = /^;;\s*(?<key>\w+)\s*=(?<value>.*)$/;

  for (const line of lines) {
    const match = metadataRegex.exec(line);
    if (!match) continue;
    const key = match.groups!.key;
    const value = match.groups!.value.trim();

    if (/^(?:yes|true)$/i.test(value)) {
      metadata[key] = true;
    } else if (/^(?:no|false)$/i.test(value)) {
      metadata[key] = false;
    } else if (/^(?:null)?$/i.test(value)) {
      metadata[key] = null;
    } else {
      metadata[key] = value;
    }
  }

  return metadata;
}
