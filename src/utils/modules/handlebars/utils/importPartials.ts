import { PromptPartial } from "@/types";

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
