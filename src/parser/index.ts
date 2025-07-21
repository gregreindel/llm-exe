import { BaseParser, BaseParserWithJson } from "./_base";
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
import { createCustomParser, createParser } from "./_functions";
import {
  LlmNativeFunctionParser,
  OpenAiFunctionParser,
} from "@/parser/parsers/LlmNativeFunctionParser";

export {
  BaseParser,
  BaseParserWithJson,
  BooleanParser,
  StringParser,
  NumberParser,
  JsonParser,
  ListToJsonParser,
  ListToKeyValueParser,
  ListToArrayParser,
  ReplaceStringTemplateParser,
  LlmNativeFunctionParser,
  OpenAiFunctionParser,
  MarkdownCodeBlockParser,
  MarkdownCodeBlocksParser,
  CustomParser,
  createParser,
  createCustomParser,
};

// Export FunctionCallParser as an alias for LlmNativeFunctionParser
export { LlmNativeFunctionParser as FunctionCallParser } from "./parsers/LlmNativeFunctionParser";

// Export types 
export type {
  FunctionCall,
  LlmNativeFunctionParserOptions as FunctionCallParserOptions,
} from "./parsers/LlmNativeFunctionParser";