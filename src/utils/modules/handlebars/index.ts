import { importPartials, registerPartials, importHelpers,
  registerHelpers } from "./hbs";
import * as helpers from "./helpers";
import * as contextPartials from "./templates";
import { PromptTemplateOptions,  } from "@/types";
import { getEnvironmentVariable } from "@/utils";

export function useHandlebars(
  configuration: PromptTemplateOptions = {
    helpers: [],
    partials: [],
  },
  hbsInstance: typeof Handlebars
) {
  const helperKeys = Object.keys(helpers) as (keyof typeof helpers)[];
  for (const helperKey of helperKeys) {
    hbsInstance.registerHelper(helperKey, helpers[helperKey]);
  }

  if (configuration?.helpers && Array.isArray(configuration.helpers)) {
    registerHelpers(configuration.helpers)
  }

  const helperPath = getEnvironmentVariable('CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH');
  if (helperPath) {
    const externalHelpers = require(helperPath);
    registerHelpers(importHelpers(externalHelpers))
  }

  const contextPartialKeys = Object.keys(
    contextPartials.partials
  ) as (keyof typeof contextPartials.partials)[];
  for (const contextPartialKey of contextPartialKeys) {
    hbsInstance.registerPartial(
      contextPartialKey,
      contextPartials.partials[contextPartialKey]
    );
  }

  if (configuration?.partials && Array.isArray(configuration.partials)) {
    registerPartials(configuration.partials)
  }

  const partialsPath = getEnvironmentVariable('CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH');
  if (typeof process === "object" && partialsPath) {
    const externalPartials = require(partialsPath);
    registerPartials(importPartials(externalPartials));
  }

  /* istanbul ignore next */
  hbsInstance.registerHelper("with", function (context: any, options: any) {
    return options.fn(context);
  });

  /* istanbul ignore next */
  hbsInstance.registerHelper("cut", function (str: string, arg2: string | RegExp) {
    return str.toString().replace(new RegExp(arg2, "g"), "");
  });

  /* istanbul ignore next */
  hbsInstance.registerHelper(
    "substring",
    function (str: string, start: number, end: number) {
      if (str.length > end) {
        return str.substring(start, end);
      } else {
        return str;
      }
    }
  );

  return hbsInstance;
}
