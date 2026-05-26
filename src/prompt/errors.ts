import { LlmExeError } from "@/utils/modules/errors";

// Temporary local formatter. When the v3 error infrastructure from
// error-handling-spec.md lands (formatErrorList, createLlmExeError, etc.),
// replace this with the shared helper and convert this builder to
// createLlmExeError(definition, context).
function formatList(values: string[]): string {
  return values.map((v) => `"${v}"`).join(", ");
}

export interface MissingTemplateReferencesContext {
  operation: "Prompt.validate";
  promptType: string;
  missingVariables: string[];
  missingHelpers: string[];
}

function buildMessage(context: MissingTemplateReferencesContext): string {
  const { missingVariables, missingHelpers } = context;
  if (missingVariables.length && missingHelpers.length) {
    return `Prompt template has unresolved references. Missing variables: ${formatList(missingVariables)}. Missing helpers: ${formatList(missingHelpers)}.`;
  }
  if (missingVariables.length) {
    return `Prompt template references variables not provided: ${formatList(missingVariables)}.`;
  }
  return `Prompt template references helpers not registered: ${formatList(missingHelpers)}.`;
}

export function missingTemplateReferencesError(
  context: MissingTemplateReferencesContext
): LlmExeError<"prompt.missing_template_variable"> {
  return new LlmExeError(
    buildMessage(context),
    "prompt.missing_template_variable",
    context
  );
}
