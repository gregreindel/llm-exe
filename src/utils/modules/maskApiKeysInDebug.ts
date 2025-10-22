/**
 * Masks sensitive API keys in a log string
 * @param log - The log string that may contain API keys
 * @param options - Configuration options for masking
 * @returns The log string with masked API keys
 */
export function maskApiKeys(log: string): string {
  // Look for Bearer tokens and common API key patterns
  return log.replace(
    /\b(Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+|Bearer\s+[A-Za-z0-9\-_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16}|[A-Za-z0-9]{32,})\b/g,
    (match) => {
      // Keep first 4 and last 4 characters
      if (match.length <= 8) return match;

      const prefix = match.substring(0, 4);
      const suffix = match.substring(match.length - 4);
      const maskLength = match.length - 8;

      return `${prefix}${"*".repeat(maskLength)}${suffix}`;
    }
  );
}
