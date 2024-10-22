import { maybeParseJSON, maybeStringifyJSON } from "@/utils";
import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";

export function indentJson(
  this: any,
  arg1: Record<string, any>,
  collapse = "false"
) {
  if (typeof arg1 !== "object") {
    return replaceTemplateString(arg1 || "", this);
  }
  const replaced = maybeParseJSON(
    replaceTemplateString(maybeStringifyJSON(arg1), this)
  );

  if (collapse == "true") {
    return JSON.stringify(replaced);
  }

  return JSON.stringify(replaced, null, 2);
}
