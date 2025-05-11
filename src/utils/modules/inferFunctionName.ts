export function inferFunctionName(func: unknown, defaultName: string): string {
  if (typeof func !== "function") return defaultName;

  const name = func.name;

  if (typeof name === "string" && name.length > 0) {
    return name.startsWith("bound ") ? name.slice(6) : name;
  }

  // Legacy fallback (non-standard or minified)
  const match = /^function\s+([\w$]+)\s*\(/.exec(func.toString());

  // istanbul ignore next
  return match?.[1] ?? defaultName;
}
