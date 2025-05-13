import Handlebars from "handlebars";
import { _registerPartials } from "@/utils/modules/handlebars/utils/registerPartials";
import { _registerHelpers } from "@/utils/modules/handlebars/utils/registerHelpers";

import * as contextPartials from "@/utils/modules/handlebars/templates";
import * as helpers from "@/utils/modules/handlebars/helpers";

export function makeHandlebarsInstance(hbs: typeof Handlebars) {
  const handlebars = hbs.create();

  const helperKeys = Object.keys(helpers) as (keyof typeof helpers)[];
  _registerHelpers(
    helperKeys.map((a) => ({ handler: helpers[a], name: a })),
    handlebars
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

  const contextPartialKeys = Object.keys(
    contextPartials.partials
  ) as (keyof typeof contextPartials.partials)[];
  for (const contextPartialKey of contextPartialKeys) {
    handlebars.registerPartial(
      contextPartialKey,
      contextPartials.partials[contextPartialKey]
    );
  }

  return handlebars;
}
