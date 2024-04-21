import { PromptTemplateOptions } from "@/types";
import { useHandlebars } from "./handlebars";
import { hbs, hbsAsync } from "./handlebars/hbs";

export function replaceTemplateString(
  templateString?: string,
  substitutions: Record<string, any> = {},
  configuration: PromptTemplateOptions = {
    helpers: [],
    partials: [],
  }
): string {
  if (!templateString) return templateString || "";

  const instance = useHandlebars(configuration, hbs);
  const template = instance.compile(templateString);
  const res = template(substitutions, {
    allowedProtoMethods: {
      substring: true,
    },
  });
  return res;
}


export function replaceTemplateStringAsync(
  templateString?: string,
  substitutions: Record<string, any> = {},
  configuration: PromptTemplateOptions = {
    helpers: [],
    partials: [],
  }
) {
  if (!templateString) return Promise.resolve(templateString || "");
  const instance = useHandlebars(configuration, hbsAsync)
  const template = instance.compile(templateString);
   return template(substitutions, {
      allowedProtoMethods: {
        substring: true,
      },
    }) as unknown as Promise<string>
}
