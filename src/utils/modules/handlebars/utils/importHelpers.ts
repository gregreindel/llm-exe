import { PromptHelper } from "@/types";

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