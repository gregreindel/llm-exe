import { JSONSchema } from "json-schema-to-ts";
import {
  BaseParserOptionsWithSchema,
  CreateParserType,
  ExecutorContext,
} from "@/types";
import { StringParser } from "./parsers/StringParser";
import { BooleanParser } from "./parsers/BooleanParser";
import { NumberParser } from "./parsers/NumberParser";
import { JsonParser } from "./parsers/JsonParser";
import { ListToJsonParser } from "./parsers/ListToJsonParser";
import { ListToKeyValueParser } from "./parsers/ListToKeyValueParser";
import { CustomParser } from "./parsers/CustomParser";
import { ListToArrayParser } from "./parsers/ListToArrayParser";
import { ReplaceStringTemplateParser } from "./parsers/ReplaceStringTemplateParser";
import { MarkdownCodeBlockParser } from "./parsers/MarkdownCodeBlock";
import { MarkdownCodeBlocksParser } from "./parsers/MarkdownCodeBlocks";

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToKeyValue">} type - The type of parser to create.
 * @returns An instance of ListToKeyValueParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "markdownCodeBlocks">
): MarkdownCodeBlocksParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToKeyValue">} type - The type of parser to create.
 * @returns An instance of ListToKeyValueParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "markdownCodeBlock">
): MarkdownCodeBlockParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToKeyValue">} type - The type of parser to create.
 * @returns An instance of ListToKeyValueParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "listToKeyValue">
): ListToKeyValueParser;

/**
 * Creates a parser based on the given type and schema.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToJson">} type - The type of parser to create.
 * @param {S} [schema] - The JSON schema.
 * @returns An instance of ListToJsonParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "listToJson">,
  options?: BaseParserOptionsWithSchema<S>
): ListToJsonParser<S>;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToArray">} type - The type of parser to create.
 * @returns An instance of ListToArrayParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "listToArray">
): ListToArrayParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "number">} type - The type of parser to create.
 * @returns An instance of NumberParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "number">
): NumberParser;
/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "number">} type - The type of parser to create.
 * @returns An instance of NumberParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "boolean">
): BooleanParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "replaceStringTemplate">} type - The type of parser to create.
 * @returns  An instance of ReplaceStringTemplateParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "replaceStringTemplate">
): ReplaceStringTemplateParser;

/**
 * Creates a parser based on the given type and schema.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "json">} type - The type of parser to create.
 * @param {S} [schema] - The JSON schema.
 * @returns An instance of JsonParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "json">,
  options?: BaseParserOptionsWithSchema<S>
): JsonParser<S>;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "string">} type - The type of parser to create.
 * @returns  An instance of StringParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<CreateParserType, "string">
): StringParser;

/**
 * Creates a default string parser if type defined
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "string">} type - The type of parser to create.
 * @returns An instance of StringParser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type?: undefined
): StringParser;

export function createParser<S extends JSONSchema | undefined = undefined>(
  type: Extract<
    CreateParserType,
    | "json"
    | "string"
    | "number"
    | "boolean"
    | "listToArray"
    | "listToKeyValue"
    | "replaceStringTemplate"
    | "listToJson"
    | "markdownCodeBlocks"
    | "markdownCodeBlock"
  >,
  options?: BaseParserOptionsWithSchema<S>
):
  | JsonParser<S>
  | StringParser
  | NumberParser
  | BooleanParser
  | ListToArrayParser
  | ListToKeyValueParser
  | ReplaceStringTemplateParser
  | MarkdownCodeBlockParser
  | MarkdownCodeBlocksParser
  | ListToJsonParser<S>;

/**
 * Creates a parser based on the given type and schema.
 * @template S - JSON schema type.
 * @param type - The type of parser to create.
 * @param options - The parser options.
 * @returns  An instance of the specified parser.
 */
export function createParser<S extends JSONSchema | undefined = undefined>(
  type?: Extract<
    CreateParserType,
    | "json"
    | "string"
    | "number"
    | "boolean"
    | "listToArray"
    | "listToKeyValue"
    | "replaceStringTemplate"
    | "listToJson"
    | "markdownCodeBlocks"
    | "markdownCodeBlock"
  >,
  options?: BaseParserOptionsWithSchema<S>
):
  | StringParser
  | NumberParser
  | BooleanParser
  | ListToArrayParser
  | ListToKeyValueParser
  | ReplaceStringTemplateParser
  | MarkdownCodeBlockParser
  | MarkdownCodeBlocksParser
  | ListToJsonParser<any>
  | JsonParser<any> {
  switch (type) {
    case "markdownCodeBlocks":
      return new MarkdownCodeBlocksParser();
    case "markdownCodeBlock":
      return new MarkdownCodeBlockParser();
    case "json":
      return new JsonParser(options);
    case "listToArray":
      return new ListToArrayParser();
    case "listToJson":
      return new ListToJsonParser(options);
    case "listToKeyValue":
      return new ListToKeyValueParser();
    case "replaceStringTemplate":
      return new ReplaceStringTemplateParser();
    case "boolean":
      return new BooleanParser();
    case "number":
      return new NumberParser();
    case "string":
    default:
      return new StringParser();
  }
}

export function createCustomParser<T>(
  name: string,
  parserFn: (text: string, inputValues: ExecutorContext<any, any>) => T
) {
  return new CustomParser<
    ReturnType<typeof parserFn>,
    Parameters<typeof parserFn>
  >(name, parserFn);
}
