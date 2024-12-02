import { PromptTemplateOptions } from "@/types";
import { hbs } from "@/utils/modules/handlebars";
import { registerHelpers, registerPartials } from "@/utils/modules/handlebars";

export function replaceTemplateString(
  templateString?: string,
  substitutions: Record<string, any> = {},
  configuration: PromptTemplateOptions = {
    helpers: [],
    partials: [],
  }
): string {
  if (!templateString) return templateString || "";

  const tempHelpers = [];
  const tempPartials = [];

  if (Array.isArray(configuration.helpers)) {
    registerHelpers(configuration.helpers, hbs);
    tempHelpers.push(...configuration.helpers.map((a) => a.name));
  }

  if (Array.isArray(configuration.partials)) {
    registerPartials(configuration.partials, hbs);
    tempPartials.push(...configuration.partials.map((a) => a.name));
  }

  const template = hbs.compile(templateString);
  const res = template(substitutions, {
    allowedProtoMethods: {
      substring: true,
    },
  });

  tempHelpers.forEach(function (n) {
    hbs.unregisterHelper(n);
  });

  tempPartials.forEach(function (n) {
    hbs.unregisterPartial(n);
  });

  return res;
}

