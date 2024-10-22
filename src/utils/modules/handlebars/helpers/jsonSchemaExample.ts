import {
  maybeParseJSON,
  maybeStringifyJSON,
} from "@/utils";
import { get } from "@/utils/modules/get";
import { schemaExampleWith } from "@/utils/modules/schemaExampleWith";
import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";

export function jsonSchemaExample(
  this: any,
  key: string,
  prop: string,
  collapse: string
) {
  const schema = get(this, key);
  if (schema && schema.type) {
    const result = schemaExampleWith(schema, prop);
    if (typeof result !== "object") {
      return "";
    }
    const replaced = maybeParseJSON(
      replaceTemplateString(maybeStringifyJSON(result), this)
    );

    if (collapse == "true") {
      return JSON.stringify(replaced);
    }

    return JSON.stringify(replaced, null, 2);
  }
  return "";
}
