import { FunctionCallParser } from "@/parser/parsers/FunctionCallParser";
import { OpenAiFunctionParser } from "@/parser/parsers/OpenAiFunctionParser"; // For backward compatibility
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
  FunctionCallParser,
  OpenAiFunctionParser,
  MarkdownCodeBlockParser,
  MarkdownCodeBlocksParser,
  CustomParser,
  createParser,
  createCustomParser,
};

// Export types from FunctionCallParser
export type {
  FunctionCall,
  FunctionCallParserOptions,
} from "./parsers/FunctionCallParser";
