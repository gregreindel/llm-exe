import { create } from "handlebars";
import * as helpers from "./helpers";
import * as contextPartials from "./templates";
import { PromptTemplateOptions } from "@/types";

export function useHandlebars(
  configuration: PromptTemplateOptions = {
    helpers: [],
    partials: [],
  }
) {
  var hbs = create();
  const helperKeys = Object.keys(helpers) as (keyof typeof helpers)[];
  for (const helperKey of helperKeys) {
    hbs.registerHelper(helperKey, helpers[helperKey]);
  }

  if (configuration?.helpers && Array.isArray(configuration.helpers)) {
    for (const externalHelper of configuration.helpers) {
      if (
        externalHelper.name &&
        typeof externalHelper.name === "string" &&
        typeof externalHelper.handler === "function"
      ) {
        hbs.registerHelper(externalHelper.name, externalHelper.handler);
      }
    }
  }

  if (process?.env?.CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH) {
    const externalHelpers = require(process.env
      .CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH);
    if (externalHelpers) {
      const externalHelperKeys = Object.keys(
        externalHelpers
      ) as (keyof typeof externalHelpers)[];
      for (const externalHelperKey of externalHelperKeys) {
        if (typeof externalHelperKey === "string") {
          hbs.registerHelper(
            externalHelperKey,
            externalHelpers[externalHelperKey]
          );
        }
      }
    }
  }

  const contextPartialKeys = Object.keys(
    contextPartials.partials
  ) as (keyof typeof contextPartials.partials)[];
  for (const contextPartialKey of contextPartialKeys) {
    hbs.registerPartial(
      contextPartialKey,
      contextPartials.partials[contextPartialKey]
    );
  }

  if (configuration?.partials && Array.isArray(configuration.partials)) {
    for (const externalPartial of configuration.partials) {
      if (
        externalPartial.name &&
        typeof externalPartial.name === "string" &&
        typeof externalPartial.template === "string"
      ) {
        hbs.registerPartial(externalPartial.name, externalPartial.template);
      }
    }
  }

  if (process?.env?.CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH) {
    const externalPartials = require(process.env
      .CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH);
    if (externalPartials) {
      const externalPartialKeys = Object.keys(
        externalPartials
      ) as (keyof typeof externalPartials)[];
      for (const externalPartialKey of externalPartialKeys) {
        if (typeof externalPartialKey === "string") {
          hbs.registerPartial(
            externalPartialKey,
            externalPartials[externalPartialKey]
          );
        }
      }
    }
  }

  /* istanbul ignore next */
  hbs.registerHelper("with", function (context, options) {
    return options.fn(context);
  });

  /* istanbul ignore next */
  hbs.registerHelper("cut", function (str: string, arg2: string | RegExp) {
    return str.toString().replace(new RegExp(arg2, "g"), "");
  });

  /* istanbul ignore next */
  hbs.registerHelper(
    "substring",
    function (str: string, start: number, end: number) {
      if (str.length > end) {
        return str.substring(start, end);
      } else {
        return str;
      }
    }
  );

  return hbs;
}
