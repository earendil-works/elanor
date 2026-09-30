export interface IconMetadata {
  tags: string[];
}

export function validateMetadata(
  value: unknown,
  sourceFiles: readonly string[],
): asserts value is Record<string, IconMetadata> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("metadata.json: expected an object keyed by source icon name");
  }
  const metadata = value as Record<string, unknown>;
  const sourceNames = new Set(sourceFiles.map((file) => file.slice(0, -".svg".length)));

  for (const name of sourceNames) {
    if (!Object.hasOwn(metadata, name)) throw new Error(`metadata.json: missing tags for ${name}`);
  }
  for (const [name, entry] of Object.entries(metadata)) {
    if (!sourceNames.has(name)) throw new Error(`metadata.json: ${name} has no source SVG`);
    if (!entry || typeof entry !== "object" || Array.isArray(entry) || !("tags" in entry)) {
      throw new Error(`metadata.json: invalid entry for ${name}`);
    }
    const {tags} = entry;
    if (
      !Array.isArray(tags) ||
      tags.length === 0 ||
      tags.some((tag) => typeof tag !== "string" || !tag || tag !== tag.trim().toLowerCase()) ||
      new Set(tags).size !== tags.length
    ) {
      throw new Error(`metadata.json: ${name} must have distinct, nonempty, lowercase tags`);
    }
  }
}
