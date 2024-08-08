import {
  importPartials,
  registerPartials,
  importHelpers,
  registerHelpers,
} from "./utils/hbs";
import * as helpers from "./helpers";
import { asyncCoreOverrideHelpers } from "./helpers/async/async-helpers";
import * as contextPartials from "./templates";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";

import Handlebars from "handlebars";
import { makeHandlebarsInstanceAsync } from "./utils/asyncHelpers";

const __hbs = Handlebars;
const __hbsAsync = makeHandlebarsInstanceAsync(Handlebars);

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
    function (
      conditional: any,
      options: any
    ) {
      if (arguments.length !== 2) {
        throw new Error("#unless requires exactly one argument");
      }

      const ifFn = hbsInstance.helpers["if"]
      return ifFn(conditional, {
        fn: options.inverse,
        inverse: options.fn,
        hash: options.hash,
      });
    }
  );

  const helperKeys = Object.keys(helpers) as (keyof typeof helpers)[];
  registerHelpers(hbsInstance, helperKeys.map(a => ({ handler: helpers[a], name: a})));

  if(preferAsync){
    const asyncHelperKeys = Object.keys(asyncCoreOverrideHelpers) as (keyof typeof asyncCoreOverrideHelpers)[];
    registerHelpers(hbsInstance, asyncHelperKeys.map(a => ({ handler: asyncCoreOverrideHelpers[a], name: a})));
  }


  // if (configuration?.helpers && Array.isArray(configuration.helpers)) {
  //   registerHelpers(hbsInstance, configuration.helpers);
  // }

  const helperPath = getEnvironmentVariable(
    "CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH"
  );
  if (helperPath) {
    const externalHelpers = require(helperPath);
    registerHelpers(hbsInstance, importHelpers(externalHelpers));
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

  // if (configuration?.partials && Array.isArray(configuration.partials)) {
  //   registerPartials(hbsInstance, configuration.partials);
  // }

  const partialsPath = getEnvironmentVariable(
    "CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH"
  );
  if (typeof process === "object" && partialsPath) {
    const externalPartials = require(partialsPath);
    registerPartials(hbsInstance, importPartials(externalPartials));
  }

  return hbsInstance;
}

export const hbsAsync = useHandlebars(__hbsAsync)
export const hbs = useHandlebars(__hbs)
