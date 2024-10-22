import Handlebars from "handlebars";
import { useHandlebars } from "@/utils/modules/handlebars/useHandlebars";
import { makeHandlebarsInstanceAsync } from "@/utils/modules/handlebars/utils/makeHandlebarsInstanceAsync";

const __hbsAsync = makeHandlebarsInstanceAsync(Handlebars);
const __hbs = Handlebars.create()

export const hbs = useHandlebars(__hbs);
export const hbsAsync = useHandlebars(__hbsAsync, true);

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
