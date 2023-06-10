import { JSONSchema, JSONSchema7, FromSchema } from "json-schema-to-ts";
import { filterObjectOnSchema } from "@/utils";
import { validate as validateSchema } from "jsonschema";

export function enforceParserSchema<
  S extends JSONSchema | undefined = undefined,
  T = S extends JSONSchema ? FromSchema<S> : Record<string, any>
>(schema: S, parsed: T): T {
  if (!schema || !parsed || typeof parsed !== "object") {
    return parsed as T;
  }
  return filterObjectOnSchema(schema, parsed) as T;
}

export function validateParserSchema<
  S extends JSONSchema7,
  T extends Record<string, any>
>(schema: S, parsed: T) {
  if (!schema || !parsed || typeof parsed !== "object") {
    return null;
  }
  const validate = validateSchema(parsed, schema);

  if (validate.errors.length) {
    return validate.errors;
  }

  return null;
}
