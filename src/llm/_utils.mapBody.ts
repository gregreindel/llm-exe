import { convertDotNotation } from "@/utils/modules/convertDotNotation";
import { Config } from "@/types";

// Helper function to get nested values using dot notation
export function getNestedValue(obj: Record<string, any>, path: string): any {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

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
      // Handle dot notation in input keys (e.g., "_options.jsonSchema")
      let valueForThisKey = genericInputKey.includes(".")
        ? getNestedValue(body, genericInputKey)
        : body[genericInputKey];

      if (
        providerSpecificSettings.sanitize &&
        typeof providerSpecificSettings.sanitize === "function"
      ) {
        valueForThisKey = providerSpecificSettings.sanitize(
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
