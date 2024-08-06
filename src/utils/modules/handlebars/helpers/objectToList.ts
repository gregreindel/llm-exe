export function objectToList(
    this: Record<string, string>,
    arg: Record<string, string> = {}
  ) {
    return Object.keys(arg)
      .map((key) => `- ${key}: ${arg[key]}`)
      .join("\n");
  }
  