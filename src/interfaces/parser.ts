import { JSONSchema7 } from "json-schema-to-ts";

export type CreateParserType =
  | "json"
  | "string"
  | "boolean"
  | "number"
  | "stringExtract"
  | "listToArray"
  | "listToJson"
  | "listToKeyValue"
  | "replaceStringTemplate"
  | "markdownCodeBlocks"
  | "markdownCodeBlock";


export interface BaseParserOptions {}

export interface BaseParserOptionsWithSchema<
  S extends JSONSchema7 | undefined = undefined
> extends BaseParserOptions {
  schema?: S;
  validateSchema?: boolean;
}
