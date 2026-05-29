const warned = new Set<string>();

export function emitParserDeprecationWarning(
  parserName: string,
  replacement: string,
  removalVersion = "4.0"
): void {
  if (
    typeof process !== "object" ||
    typeof process?.emitWarning !== "function"
  ) {
    return;
  }
  if (warned.has(parserName)) return;
  warned.add(parserName);

  process.emitWarning(
    `Parser "${parserName}" is deprecated and will be removed in v${removalVersion}. Use "${replacement}" instead.`,
    {
      type: "DeprecationWarning",
      code: "LLM_EXE_DEPRECATED_PARSER",
      detail: JSON.stringify({ parser: parserName, replacement, removalVersion }),
    }
  );
}

export function _resetParserDeprecationWarnings(): void {
  warned.clear();
}
