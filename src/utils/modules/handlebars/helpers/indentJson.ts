import { maybeParseJSON, maybeStringifyJSON } from "@/utils/modules/json";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";

export function indentJson(
  this: any,
  arg1: Record<string, any>,
  collapse = "false"
) {
  if (typeof arg1 !== "object") {
    return replaceTemplateStringSimple(arg1 || "", this);
  }
  const replaced = maybeParseJSON(
    replaceTemplateStringSimple(maybeStringifyJSON(arg1), this)
  );

  if (collapse == "true") {
    return JSON.stringify(replaced);
  }

  return JSON.stringify(replaced, null, 2);
}
