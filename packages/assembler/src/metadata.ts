export type Metadata = Record<string, MetadataValue>;
export type MetadataValue = string;

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
 * - Keys are alphanumeric and can include underscores (`_`) and hyphens (`-`).
 * - Values can be any string, but leading and trailing whitespace is trimmed.
 * - If a key appears multiple times, the last value is used.
 *
 * @param source The assembly source code to extract metadata from.
 * @returns A record with the metadata key-value pairs.
 * @see https://vonsim.github.io/en/reference/metadata
 */
export function getMetadataFromProgram(source: string): Metadata {
  const metadata: Metadata = {};
  const lines = source.split("\n");

  const metadataRegex = /^;;\s*(?<key>[\w-]+)\s*=(?<value>.*)$/;

  for (const line of lines) {
    const match = metadataRegex.exec(line);
    if (!match) continue;

    const key = match.groups!.key;
    const value = match.groups!.value.trim();
    if (value.length > 0) {
      metadata[key] = value;
    }
  }

  return metadata;
}
