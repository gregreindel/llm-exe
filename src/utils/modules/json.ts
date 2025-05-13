export const maybeStringifyJSON = (objOrMaybeString: any): string => {
  if (!objOrMaybeString || typeof objOrMaybeString !== "object") {
    return objOrMaybeString;
  }
  try {
    const result = JSON.stringify(objOrMaybeString);
    return result;
  } catch (error) {}
  return "";
};

export const maybeParseJSON = <Expected = any>(
  objOrMaybeJSON: any
): Expected => {
  if (!objOrMaybeJSON) return {} as Expected;

  if (typeof objOrMaybeJSON === "string") {
    try {
      const cleanMarkdown = helpJsonMarkup(objOrMaybeJSON);
      const result = JSON.parse(cleanMarkdown);
      if (typeof result === "object" && result !== null) {
        return result as Expected;
      }
    } catch (error) {
      /* silently catch */
    }
  }

  if (typeof objOrMaybeJSON === "object" && objOrMaybeJSON !== null) {
    return objOrMaybeJSON as Expected;
  }

  return {} as Expected;
};

export function isObjectStringified(maybeObject: string) {
  if (typeof maybeObject !== "string") return false;

  const trimmed = maybeObject.trim();

  const isWrapped =
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"));

  if (!isWrapped) return false;

  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

export function helpJsonMarkup(str: string) {
  if (typeof str !== "string") {
    return str;
  }
  // TODO: improve?
  const input = str.trim();
  const markdownJsonStartsWith = "```json";
  const markdownJsonEndsWith = "```";
  if (
    input.substring(0, markdownJsonStartsWith.length) ===
      markdownJsonStartsWith &&
    input.substring(
      input.length - markdownJsonEndsWith.length,
      input.length
    ) === markdownJsonEndsWith
  ) {
    return str
      .substring(
        markdownJsonStartsWith.length,
        input.length - markdownJsonEndsWith.length
      )
      ?.trim();
  }
  return str;
}
