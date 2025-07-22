export { assert } from "./assert";
export { defineSchema } from "./defineSchema";
export { importPartials } from "./handlebars/utils/importPartials";
export { importHelpers } from "./handlebars/utils/importHelpers";
export { filterObjectOnSchema } from "./filterObjectOnSchema";
export { replaceTemplateString } from "./replaceTemplateString";
export { replaceTemplateStringAsync } from "./replaceTemplateStringAsync";
export { asyncCallWithTimeout } from "./asyncCallWithTimeout";
export { guessProviderFromModel } from "./guessProviderFromModel";
export { generateToolCallId } from "./generateToolCallId";

export {
  maybeStringifyJSON,
  maybeParseJSON,
  isObjectStringified,
} from "./json";

import { hbs, hbsAsync } from "./handlebars";

export function registerHelpers(helpers: any[]) {
  hbs.registerHelpers(helpers);
  hbsAsync.registerHelpers(helpers);
}

export function registerPartials(partials: any[]) {
  hbs.registerPartials(partials);
  hbsAsync.registerPartials(partials);
}
