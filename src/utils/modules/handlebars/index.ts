import Handlebars from "handlebars";

import { importHelpers } from "@/utils/modules/handlebars/utils/importHelpers";
import { importPartials } from "@/utils/modules/handlebars/utils/importPartials";

import * as helpers from "@/utils/modules/handlebars/helpers";
import * as contextPartials from "@/utils/modules/handlebars/templates";
import { makeHandlebarsInstanceAsync } from "@/utils/modules/handlebars/utils/makeHandlebarsInstanceAsync";

import { asyncCoreOverrideHelpers } from "@/utils/modules/handlebars/helpers/async/async-helpers";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";

const __hbsAsync = makeHandlebarsInstanceAsync(Handlebars);
const __hbs = Handlebars

export function useHandlebars(
  hbsInstance: typeof Handlebars,
  preferAsync: boolean = false
) {
  /* istanbul ignore next */
  hbsInstance.registerHelper("with", function (context: any, options: any) {
    return options.fn(context);
  });

  /* istanbul ignore next */
  hbsInstance.registerHelper(
    "cut",
    function (str: string, arg2: string | RegExp) {
      return str.toString().replace(new RegExp(arg2, "g"), "");
    }
  );

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

  hbsInstance.registerHelper(
    "unless",
    function (conditional: any, options: any) {
      if (arguments.length !== 2) {
        throw new Error("#unless requires exactly one argument");
      }

      const ifFn = hbsInstance.helpers["if"];
      return ifFn(conditional, {
        fn: options.inverse,
        inverse: options.fn,
        hash: options.hash,
      });
    }
  );

  const helperKeys = Object.keys(helpers) as (keyof typeof helpers)[];
  registerHelpers(
    helperKeys.map((a) => ({ handler: helpers[a], name: a })),
    hbsInstance,
  );

  if (preferAsync) {
    const asyncHelperKeys = Object.keys(
      asyncCoreOverrideHelpers
    ) as (keyof typeof asyncCoreOverrideHelpers)[];
    registerHelpers(
      asyncHelperKeys.map((a) => ({
        handler: asyncCoreOverrideHelpers[a],
        name: a,
      })),
      hbsInstance,
    );
  }

  const helperPath = getEnvironmentVariable(
    "CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH"
  );
  if (helperPath) {
    const externalHelpers = require(helperPath);
    registerHelpers(importHelpers(externalHelpers), hbsInstance);
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

  const partialsPath = getEnvironmentVariable(
    "CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH"
  );
  if (typeof process === "object" && partialsPath) {
    const externalPartials = require(partialsPath);
    registerPartials(importPartials(externalPartials), hbsInstance);
  }

  return hbsInstance;
}

export const hbsAsync = useHandlebars(__hbsAsync);
export const hbs = useHandlebars(__hbs);

export function registerPartials(partials: any[], instance?: typeof Handlebars ) {
  if (partials && Array.isArray(partials)) {
    for (const partial of partials) {
      if (
        partial.name &&
        typeof partial.name === "string" &&
        typeof partial.template === "string"
      ) {
        if(instance){
          instance.registerPartial(partial.name, partial.template);
        }else {
          hbs.registerPartial(partial.name, partial.template);
          hbsAsync.registerPartial(partial.name, partial.template);
        }
      }
    }
  }
}

export function registerHelpers(helpers: any[], instance?: typeof Handlebars) {
  if (helpers && Array.isArray(helpers)) {
    for (const helper of helpers) {
      if (
        helper.name &&
        typeof helper.name === "string" &&
        typeof helper.handler === "function"
      ) {
        if(instance){
          instance.registerHelper(helper.name, helper.handler);
        }else {
          hbs.registerHelper(helper.name, helper.handler);
          hbsAsync.registerHelper(helper.name, helper.handler);
        }

      }
    }
  }
}
