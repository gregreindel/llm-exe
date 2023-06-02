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
import {
  StringExtractParser,
  StringExtractParserOptions,
} from "./parsers/StringExtractParser";

export type ParserOptions<T extends CreateParserType, S extends JSONSchema | undefined = undefined> = T extends "json"
  ? BaseParserOptionsWithSchema<S>
  : T extends "listToJson"
  ? BaseParserOptionsWithSchema<S>
  : T extends "stringExtract"
  ? StringExtractParserOptions
  : T extends "markdownCodeBlocks"
  ? undefined
  : T extends "markdownCodeBlock"
  ? undefined
  : T extends "listToArray"
  ? undefined
  : T extends "listToKeyValue"
  ? undefined
  : T extends "replaceStringTemplate"
  ? undefined
  : T extends "number"
  ? undefined
  : T extends "boolean"
  ? undefined
  : T extends "string"
  ? undefined
  : undefined;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToKeyValue">} type - The type of parser to create.
 * @returns An instance of ListToKeyValueParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "markdownCodeBlocks">,
>(
  type: T
): MarkdownCodeBlocksParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToKeyValue">} type - The type of parser to create.
 * @returns An instance of ListToKeyValueParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "markdownCodeBlock">,
>(
  type: T
): MarkdownCodeBlockParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToKeyValue">} type - The type of parser to create.
 * @returns An instance of ListToKeyValueParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "listToKeyValue">,
>(type: T): ListToKeyValueParser;

/**
 * Creates a parser based on the given type and schema.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToJson">} type - The type of parser to create.
 * @param options - The JSON schema.
 * @returns An instance of ListToJsonParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "listToJson">,
  S extends JSONSchema | undefined = undefined
>(type: T, options: ParserOptions<T, S>): ListToJsonParser<S>;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "listToArray">} type - The type of parser to create.
 * @returns An instance of ListToArrayParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "listToArray">,
  S extends JSONSchema | undefined = undefined
>(type: T): ListToArrayParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "number">} type - The type of parser to create.
 * @returns An instance of NumberParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "number">,
  S extends JSONSchema | undefined = undefined
>(type: T): NumberParser;
/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "number">} type - The type of parser to create.
 * @returns An instance of NumberParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "boolean">,
  S extends JSONSchema | undefined = undefined
>(type: T): BooleanParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "replaceStringTemplate">} type - The type of parser to create.
 * @returns  An instance of ReplaceStringTemplateParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "replaceStringTemplate">,
  S extends JSONSchema | undefined = undefined
>(
  type: T
): ReplaceStringTemplateParser;

/**
 * Creates a parser based on the given type and schema.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "json">} type - The type of parser to create.
 * @param [options] - The JSON schema.
 * @returns An instance of JsonParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "json">,
  S extends JSONSchema | undefined = undefined
>(type: T, options: ParserOptions<T, S>): JsonParser<S>;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "string">} type - The type of parser to create.
 * @returns  An instance of StringParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "string">,
  S extends JSONSchema | undefined = undefined
>(type: T): StringParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "string">} type - The type of parser to create.
 * @returns  An instance of StringParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "stringExtract">,
  S extends JSONSchema | undefined = undefined
>(type: T, options: ParserOptions<T>): StringExtractParser;

/**
 * Creates a default string parser if type defined
 * @template S - JSON schema type.
 * @param {Extract<CreateParserType, "string">} type - The type of parser to create.
 * @returns An instance of StringParser.
 */
export function createParser<
  T extends CreateParserType,
  S extends JSONSchema | undefined = undefined
>(type?: undefined): StringParser;

export function createParser<
  T extends CreateParserType,
  S extends JSONSchema | undefined = undefined
>(
  type: T,
  options?: ParserOptions<T>
): JsonParser<S>
  | ListToJsonParser<S>
  | StringParser
  | NumberParser
  | BooleanParser
  | ListToArrayParser
  | ListToKeyValueParser
  | ReplaceStringTemplateParser
  | MarkdownCodeBlockParser
  | MarkdownCodeBlocksParser
  | StringExtractParser;

/**
 * Creates a parser based on the given type and schema.
 * @template S - JSON schema type.
 * @param type - The type of parser to create.
 * @param options - The parser options.
 * @returns  An instance of the specified parser.
 */
export function createParser<
  T extends CreateParserType,
  S extends JSONSchema | undefined = any
>(
  type?: T,
  options?: any
):
  | StringParser
  | NumberParser
  | BooleanParser
  | ListToArrayParser
  | ListToKeyValueParser
  | ReplaceStringTemplateParser
  | MarkdownCodeBlockParser
  | MarkdownCodeBlocksParser
  | ListToJsonParser<S>
  | JsonParser<any>
  | StringExtractParser {
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
    case "stringExtract":
      return new StringExtractParser(options);
    case "string":
    default:
      return new StringParser();
  }
}

export function createCustomParser<O>(
  name: string,
  parserFn: (text: string, inputValues: ExecutorContext<any, O>) => O
): CustomParser<ReturnType<typeof parserFn>> {
  return new CustomParser<ReturnType<typeof parserFn>>(name, parserFn);
}
