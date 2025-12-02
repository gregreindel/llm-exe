import { convertDotNotation } from "@/utils/modules/convertDotNotation";
import { Config } from "@/types";

export function mapBody(
  template: Config["mapBody"],
  body: Record<string, any>
) {
  const output: Record<string, any> = {};
  const keys = Object.keys(template);
  for (let i = 0; i < keys.length; i++) {
    const genericInputKey = keys[i];
    const providerSpecificSettings = template[genericInputKey];
    const { key: providerSpecificKey, default: defaultValue } =
      providerSpecificSettings;

    if (providerSpecificKey) {
      let valueForThisKey = body[genericInputKey];

      if (
        providerSpecificSettings.transform &&
        typeof providerSpecificSettings.transform === "function"
      ) {
        valueForThisKey = providerSpecificSettings.transform(
          valueForThisKey,
          Object.freeze({ ...body }),
          output
        );
      }

      if (typeof valueForThisKey !== "undefined") {
        output[providerSpecificKey] = valueForThisKey;
      } else if (
        typeof valueForThisKey === "undefined" &&
        typeof defaultValue !== "undefined"
      ) {
        output[providerSpecificKey] = defaultValue;
      }
    }
  }
  return convertDotNotation(output);
}
