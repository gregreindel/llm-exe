import { PromptTemplateOptions } from "@/types";
import { useHandlebars } from "./handlebars";

export function replaceTemplateString(
  templateString?: string,
  substitutions: Record<string, any> = {},
  configuration: PromptTemplateOptions = {
    helpers: [],
    partials: [],
  }
): string {
  if (!templateString) return templateString || "";

  const hbs = useHandlebars(configuration);
  const template = hbs.compile(templateString);
  const res = template(substitutions, {
    allowedProtoMethods: {
      substring: true,
    },
  });
  return res;
}
