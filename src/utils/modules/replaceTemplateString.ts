import { PromptTemplateOptions } from "@/types";
import { hbs } from "@/utils/modules/handlebars";
import { findMissingVariables } from "@/utils/modules/extractTemplateVariables";

export function replaceTemplateString(
  templateString?: string,
  substitutions: Record<string, any> = {},
  configuration: PromptTemplateOptions = {
    helpers: [],
    partials: [],
  }
): string {
  if (!templateString) return templateString || "";

  if (configuration.validateInput) {
    const helperNames = (configuration.helpers || []).map((h) => h.name);
    const missing = findMissingVariables(
      templateString,
      substitutions,
      helperNames
    );
    if (missing.length > 0) {
      const message = `[llm-exe] Missing template variable(s): ${missing.join(", ")}. Template expects these variables but they were not provided.`;
      if (configuration.validateInput === "strict") {
        throw new Error(message);
      } else {
        console.warn(message);
      }
    }
  }

  const tempHelpers = [];
  const tempPartials = [];

  if (Array.isArray(configuration.helpers)) {
    hbs.registerHelpers(configuration.helpers);
    tempHelpers.push(...configuration.helpers.map((a) => a.name));
  }

  if (Array.isArray(configuration.partials)) {
    hbs.registerPartials(configuration.partials);
    tempPartials.push(...configuration.partials.map((a) => a.name));
  }

  const template = hbs.handlebars.compile(templateString);
  const res = template(substitutions, {
    allowedProtoMethods: {
      substring: true,
    },
  });

  tempHelpers.forEach(function (n) {
    hbs.handlebars.unregisterHelper(n);
  });

  tempPartials.forEach(function (n) {
    hbs.handlebars.unregisterPartial(n);
  });

  return res;
}

