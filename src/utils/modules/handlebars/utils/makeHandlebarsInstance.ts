import Handlebars from "handlebars";
import { _registerPartials } from "@/utils/modules/handlebars/utils/registerPartials";
import { _registerHelpers } from "@/utils/modules/handlebars/utils/registerHelpers";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { importHelpers } from "./importHelpers";
import { importPartials } from "./importPartials";
import * as contextPartials from "@/utils/modules/handlebars/templates";
import * as helpers from "@/utils/modules/handlebars/helpers";

export function makeHandlebarsInstance(hbs: typeof Handlebars) {
  const handlebars = hbs.create()

  const helperKeys = Object.keys(helpers) as (keyof typeof helpers)[];
  _registerHelpers(
    helperKeys.map((a) => ({ handler: helpers[a], name: a })),
    handlebars,
  );

  handlebars.registerHelper(
    "hbsInTemplate",
    function (str: string, substitutions: Record<string, any>) {
      const template = handlebars.compile(str);
      return template(substitutions, {
        allowedProtoMethods: {
          substring: true,
        },
      });
    }
  );

  const helperPath = getEnvironmentVariable(
    "CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH"
  );
  if (helperPath) {
    const externalHelpers = require(helperPath);
    _registerHelpers(importHelpers(externalHelpers), handlebars);
  }

  const contextPartialKeys = Object.keys(
    contextPartials.partials
  ) as (keyof typeof contextPartials.partials)[];
  for (const contextPartialKey of contextPartialKeys) {
    handlebars.registerPartial(
      contextPartialKey,
      contextPartials.partials[contextPartialKey]
    );
  }

  const partialsPath = getEnvironmentVariable(
    "CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH"
  );
  
  if (typeof process === "object" && partialsPath) {
    const externalPartials = require(partialsPath);
    _registerPartials(importPartials(externalPartials), handlebars);
  }

  return handlebars;
}

