export function isValidUrl(input: string): boolean {
    try {
      // Attempt parsing the string as a URL.
      new URL(input);
      return true;
    } catch {
      return false;
    }
  }