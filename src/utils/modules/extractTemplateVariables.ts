function isValidIdentifier(str: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
}

export function extractTemplateVariables(templateString: string): string[] {
  const variables = new Set<string>();
  const regex = /\{\{\{?(#?)([^{}]+?)\}\}\}?/g;
  let match;

  while ((match = regex.exec(templateString)) !== null) {
    const isBlock = match[1] === "#";
    const content = match[2].trim();

    if (
      content.startsWith("/") ||
      content.startsWith(">") ||
      content.startsWith("!") ||
      content === "else"
    ) {
      continue;
    }

    const parts = content.split(/\s+/);

    if (isBlock) {
      for (let i = 1; i < parts.length; i++) {
        const arg = parts[i];
        if (arg === "as" || arg.startsWith("|")) break;
        if (
          !arg.startsWith('"') &&
          !arg.startsWith("'") &&
          !arg.includes("=")
        ) {
          const rootKey = arg.split(".")[0];
          if (isValidIdentifier(rootKey) && rootKey !== "this") {
            variables.add(rootKey);
          }
        }
      }
    } else if (parts.length === 1) {
      const rootKey = parts[0].split(".")[0];
      if (isValidIdentifier(rootKey) && rootKey !== "this") {
        variables.add(rootKey);
      }
    }
  }

  return Array.from(variables);
}

export function findMissingVariables(
  templateString: string,
  substitutions: Record<string, any>,
  registeredHelperNames: string[] = []
): string[] {
  const required = extractTemplateVariables(templateString);
  const helpers = new Set(registeredHelperNames);
  return required.filter(
    (name) => !(name in substitutions) && !helpers.has(name)
  );
}
