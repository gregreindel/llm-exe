import { JSONSchema } from "json-schema-to-ts";
import {
  BaseParserOptions,
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

export type ParserOptions<
  T extends CreateParserType,
  S extends JSONSchema | undefined = undefined
> = T extends "json"
  ? BaseParserOptionsWithSchema<S>
  : T extends "listToJson"
  ? BaseParserOptionsWithSchema<S>
  : T extends "stringExtract"
  ? StringExtractParserOptions
  : T extends "markdownCodeBlocks"
  ? BaseParserOptions
  : T extends "markdownCodeBlock"
  ? BaseParserOptions
  : T extends "listToArray"
  ? BaseParserOptions
  : T extends "listToKeyValue"
  ? BaseParserOptions
  : T extends "replaceStringTemplate"
  ? BaseParserOptions
  : T extends "number"
  ? BaseParserOptions
  : T extends "boolean"
  ? BaseParserOptions
  : T extends "string"
  ? BaseParserOptions
  : BaseParserOptions;

export type ParserMap<
S extends JSONSchema | undefined = undefined> = {
    string: StringParser,
    boolean: BooleanParser,
    number: NumberParser,
    listToArray: ListToArrayParser,
    listToKeyValue: ListToKeyValueParser,
    replaceStringTemplate: ReplaceStringTemplateParser,
    markdownCodeBlock: MarkdownCodeBlockParser,
    markdownCodeBlocks: MarkdownCodeBlocksParser,
    stringExtract: StringExtractParser,
    listToJson: ListToJsonParser<S>,
    json: JsonParser<S>,
  };


// export function createParser<
//   T extends Extract<CreateParserType, "markdownCodeBlocks">
// >(type: T): MarkdownCodeBlocksParser;
// export function createParser<
//   T extends Extract<CreateParserType, "markdownCodeBlock">
// >(type: T): MarkdownCodeBlockParser;
// export function createParser<
//   T extends Extract<CreateParserType, "listToKeyValue">
// >(type: T): ListToKeyValueParser;
// export function createParser<
//   T extends Extract<CreateParserType, "listToArray">
// >(type: T): ListToArrayParser;
// export function createParser<T extends Extract<CreateParserType, "number">>(
//   type: T
// ): NumberParser;
// export function createParser<T extends Extract<CreateParserType, "boolean">>(
//   type: T
// ): BooleanParser;
// export function createParser<
//   T extends Extract<CreateParserType, "replaceStringTemplate">
// >(type: T): ReplaceStringTemplateParser;
// export function createParser<T extends Extract<CreateParserType, "string">>(
//   type: T
// ): StringParser;
// export function createParser<
//   T extends Extract<CreateParserType, "stringExtract">
// >(type: T, options?: ParserOptions<T>): StringExtractParser;
// export function createParser<T extends Extract<CreateParserType, "listToJson">>(
//   type: T,
//   options?: ParserOptions<T>
// ): ListToJsonParser;
// export function createParser<T extends Extract<CreateParserType, "listToJson">>(
//   type: T,
//   options?: ParserOptions<T>
// ): ListToJsonParser;
// export function createParser<T extends Extract<CreateParserType, "json">>(
//   type: T,
//   options?: ParserOptions<T>
// ): JsonParser;
// export function createParser<T extends Extract<CreateParserType, "json">>(
//   type: T,
//   options?: ParserOptions<T>
// ): JsonParser;
// // export function createParser(type: CreateParserType, options?: ParserOptions) {



// export function createParser<T extends keyof ParserMap, S extends JSONSchema | undefined = undefined>(type: T, options?: ParserOptions<T, S>): ParserMap[T] {
//   switch (type) {
//     case "markdownCodeBlocks":
//       return new MarkdownCodeBlocksParser() as ParserMap[T];
//     case "markdownCodeBlock":
//       return new MarkdownCodeBlockParser() as ParserMap[T];
//     case "json":
//       return new JsonParser(options as ParserOptions<"json">) as ParserMap[T];
//     case "listToArray":
//       return new ListToArrayParser() as ParserMap[T];
//     case "listToJson":
//       return new ListToJsonParser<S>(options as ParserOptions<"listToJson">) as ParserMap<S>[T];
//     case "listToKeyValue":
//       return new ListToKeyValueParser() as ParserMap[T];
//     case "replaceStringTemplate":
//       return new ReplaceStringTemplateParser() as ParserMap[T];
//     case "boolean":
//       return new BooleanParser() as ParserMap[T];
//     case "number":
//       return new NumberParser() as ParserMap[T];
//     case "stringExtract":
//       return new StringExtractParser(options as ParserOptions<"stringExtract">) as ParserMap[T];
//     case "string":
//     default:
//       return new StringParser() as ParserMap[T];
//   }
// }

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param type - The type of parser to create.
 * @returns An instance of ListToKeyValueParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "markdownCodeBlocks">,
>(
  type: T, options?: BaseParserOptions
): MarkdownCodeBlocksParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param type - The type of parser to create.
 * @returns An instance of ListToKeyValueParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "markdownCodeBlock">,
>(
  type: T, options?: BaseParserOptions
): MarkdownCodeBlockParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param type - The type of parser to create.
 * @returns An instance of ListToKeyValueParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "listToKeyValue">,
>(type: T, options?: BaseParserOptions): ListToKeyValueParser;


/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param  type - The type of parser to create.
 * @returns An instance of ListToArrayParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "listToArray">,
  S extends JSONSchema | undefined = undefined
>(type: T, options?: BaseParserOptions): ListToArrayParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param type - The type of parser to create.
 * @returns An instance of NumberParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "number">,
  S extends JSONSchema | undefined = undefined
>(type: T, options?: BaseParserOptions): NumberParser;
/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param  type - The type of parser to create.
 * @returns An instance of NumberParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "boolean">,
  S extends JSONSchema | undefined = undefined
>(type: T, options?: BaseParserOptions): BooleanParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param  type - The type of parser to create.
 * @returns  An instance of ReplaceStringTemplateParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "replaceStringTemplate">,
  S extends JSONSchema | undefined = undefined
>(
  type: T, options?: BaseParserOptions
): ReplaceStringTemplateParser;


/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param type - The type of parser to create.
 * @returns  An instance of StringParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "string">,
  S extends JSONSchema | undefined = undefined
>(type: T, options?: BaseParserOptions): StringParser;

/**
 * Creates a parser based on the given type.
 * @template S - JSON schema type.
 * @param  type - The type of parser to create.
 * @returns  An instance of StringParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "stringExtract">,
  S extends JSONSchema | undefined = undefined
>(type: T, options?:StringExtractParserOptions): StringExtractParser;

/**
 * Creates a parser based on the given type and schema.
 * @template S - JSON schema type.
 * @param type - The type of parser to create.
 * @param options - The JSON schema.
 * @returns An instance of ListToJsonParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "listToJson">,
  S extends JSONSchema | undefined = undefined
>(type: T, options?: BaseParserOptionsWithSchema<S>): ListToJsonParser<S>;

/**
 * Creates a parser based on the given type and schema.
 * @template S - JSON schema type.
 * @param  type - The type of parser to create.
 * @param [options] - The JSON schema.
 * @returns An instance of JsonParser.
 */
export function createParser<
  T extends Extract<CreateParserType, "json">,
  S extends JSONSchema | undefined = undefined
>(type: T, options?: BaseParserOptionsWithSchema<S>): JsonParser<S>;

export function createParser<
  T extends CreateParserType,
  S extends JSONSchema | undefined = undefined
>(
  type: T,
  options?:  BaseParserOptionsWithSchema<S> |  BaseParserOptions
): | JsonParser<S>
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
  type: T,
  options: any = {}
) {
  switch (type) {
    case "json":
      return new JsonParser<S>(options);
    case "markdownCodeBlocks":
      return new MarkdownCodeBlocksParser();
    case "markdownCodeBlock":
      return new MarkdownCodeBlockParser();
    case "listToArray":
      return new ListToArrayParser();
    case "listToJson":
      return new ListToJsonParser<S>(options);
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
  parserFn: (text: string, inputValues: ExecutorContext<any, any>) => O
): CustomParser<ReturnType<typeof parserFn>> {
  return new CustomParser<ReturnType<typeof parserFn>>(name, parserFn);
}
