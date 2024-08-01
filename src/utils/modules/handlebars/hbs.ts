import { PromptPartial, PromptHelper } from "@/types";
import Handlebars from "handlebars";
import * as asyncHelpers from "handlebars-async-helpers";

export const hbs = Handlebars;
export const hbsAsync = asyncHelpers.default(Handlebars);

export function importPartials(_partials: { [key in string]: string }) {
  let partials: PromptPartial[] = [];
  if (_partials) {
    const externalPartialKeys = Object.keys(
      _partials
    ) as (keyof typeof _partials)[];
    for (const externalPartialKey of externalPartialKeys) {
      if (typeof externalPartialKey === "string") {
        partials.push({
          name: externalPartialKey,
          template: _partials[externalPartialKey],
        });
      }
    }
  }
  return partials;
}

export function importHelpers(_helpers: {
  [key in string]: (...args: any[]) => any;
}) {
  let helpers: PromptHelper[] = [];
  if (_helpers) {
    const externalHelperKeys = Object.keys(
      _helpers
    ) as (keyof typeof _helpers)[];
    for (const externalHelperKey of externalHelperKeys) {
      if (typeof externalHelperKey === "string") {
        helpers.push({
          name: externalHelperKey,
          handler: _helpers[externalHelperKey],
        });
      }
    }
  }
  return helpers;
}

export function registerPartials(partials: any[]) {
  if (partials && Array.isArray(partials)) {
    for (const partial of partials) {
      if (
        partial.name &&
        typeof partial.name === "string" &&
        typeof partial.template === "string"
      ) {
        hbs.registerPartial(partial.name, partial.template);
        hbsAsync.registerPartial(partial.name, partial.template);
      }
    }
  }
}

export function registerHelpers(helpers: any[]) {
  if (helpers && Array.isArray(helpers)) {
    for (const helper of helpers) {
      if (
        helper.name &&
        typeof helper.name === "string" &&
        typeof helper.handler === "function"
      ) {
        hbs.registerHelper(helper.name, helper.handler);
        hbsAsync.registerHelper(helper.name, helper.handler);
      }
    }
  }
}
