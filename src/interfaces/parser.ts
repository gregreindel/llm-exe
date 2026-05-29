import { JSONSchema } from "json-schema-to-ts";

export type CreateParserType =
  | "json"
  | "string"
  | "boolean"
  | "number"
  | "stringExtract"
  | "listToArray"
  | "listToEntries"
  | "listToObject"
  | "listToJson"
  | "listToKeyValue"
  | "replaceStringTemplate"
  | "markdownCodeBlocks"
  | "markdownCodeBlock";

export interface JsonParserOptions<
  S extends JSONSchema | undefined = undefined,
> {
  schema?: S;
  validateSchema?: boolean;
}

export interface ListToJsonParserOptions<
  S extends JSONSchema | undefined = undefined,
> extends JsonParserOptions<S> {
  keyTransform?: "camelCase" | "preserve";
}

/**
 * @deprecated Use `JsonParserOptions` instead. Kept for the schema-bearing
 * BaseParserWithJson constructor; not part of any v3 public surface.
 */
export type BaseParserOptionsWithSchema<
  S extends JSONSchema | undefined = undefined,
> = JsonParserOptions<S>;
