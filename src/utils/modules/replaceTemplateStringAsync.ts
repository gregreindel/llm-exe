import { PromptTemplateOptions } from "@/types";
import { hbsAsync, registerHelpers, registerPartials } from "./handlebars/hbs";

export async function replaceTemplateStringAsync(
  templateString?: string,
  substitutions: Record<string, any> = {},
  configuration: PromptTemplateOptions = {
    helpers: [],
    partials: [],
  }
) {
  if (!templateString) return Promise.resolve(templateString || "");
  const tempHelpers = [];
  const tempPartials = [];

  if (Array.isArray(configuration.helpers)) {
    registerHelpers(configuration.helpers, hbsAsync);
    tempHelpers.push(...configuration.helpers.map((a) => a.name));
  }

  if (Array.isArray(configuration.partials)) {
    registerPartials(configuration.partials, hbsAsync);
    tempPartials.push(...configuration.partials.map((a) => a.name));
  }

  const template = hbsAsync.compile(templateString);
  const res = await (template(substitutions, {
    allowedProtoMethods: {
      substring: true,
    },
  }) as unknown as Promise<string>);

  tempHelpers.forEach(function (n) {
    hbsAsync.unregisterHelper(n);
  });

  tempPartials.forEach(function (n) {
    hbsAsync.unregisterPartial(n);
  });

  return res;
}
