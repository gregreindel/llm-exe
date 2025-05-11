export function singleKeyObjectToString(input: string): string {
  try {
    const parsed = JSON.parse(input);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      const keys = Object.keys(parsed);
      if (keys.length === 1) {
        const value = parsed[keys[0]];
        if (typeof value === "string") {
          return value;
        } else {
          // Only accept single-key objects where the value is a string
          return input;
        }
      }
    }
  } catch {
    // Not valid JSON
  }

  return input;
}
