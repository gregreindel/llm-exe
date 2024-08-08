import { LlmProvider } from "@/types";
import { deepClone } from "@/utils/modules/deepClone";

type JSONSchema = {
    // Add more types here as needed
    [key: string]: any;
  };
  
  // List of keys to be removed for each provider
  const providerFieldExclusions: Record<string, string[]> = {
    "openai.chat": ["default"],  // fields to exclude for openai.chat
  };
  
  export function cleanJsonSchemaFor(
    schema: JSONSchema = {},
    provider: LlmProvider
  ): JSONSchema {
    const clone = deepClone(schema)
    const exclusions = providerFieldExclusions[provider] || [];
  
    function removeDisallowedFields(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(removeDisallowedFields);
      } else if (typeof obj === "object" && obj !== null) {
        return Object.keys(obj).reduce((acc, key) => {
          if (!exclusions.includes(key)) {
            acc[key] = removeDisallowedFields(obj[key]);
          }
          return acc;
        }, {} as any);
      }
      return obj;
    }
  
    return removeDisallowedFields(clone);
  }