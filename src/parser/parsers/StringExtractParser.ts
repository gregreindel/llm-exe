import { BaseParser, ParserInput } from "../_base";
import { BaseParserOptions } from "@/types";
import { LlmExeError } from "@/utils/modules/errors";

export type StringExtractMatch = "word" | "whole" | "substring";

export interface StringExtractParserOptions extends BaseParserOptions {
  enum: string[];
  ignoreCase?: boolean;
  match?: StringExtractMatch;
}

const REGEX_METACHAR = /[.*+?^${}()|[\]\\]/g;
const WORD_CHAR = "[\\p{L}\\p{N}]";

function escapeRegex(value: string): string {
  return value.replace(REGEX_METACHAR, "\\$&");
}

function describeType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

export class StringExtractParser extends BaseParser<string> {
  private enum: string[] = [];
  private ignoreCase: boolean;
  private match: StringExtractMatch;

  constructor(options?: StringExtractParserOptions) {
    super("stringExtract", options);
    if (options?.enum) {
      this.enum.push(...options.enum);
    }
    this.ignoreCase = options?.ignoreCase ?? true;
    this.match = options?.match ?? "word";
  }

  /**
   * v3 parser contract:
   * Category: extractor
   * Mode: configured value extraction
   *
   * Returns the single configured enum value found in input. Matching is
   * word-bounded by default; pass match: "whole" to require exact input or
   * match: "substring" for legacy contains() behavior. Case-insensitive by
   * default.
   *
   * Contract source: docs/misc/parser-v3-audit.md#parser-stringextract
   */
  parse(text: ParserInput) {
    if (typeof text !== "string") {
      const received = describeType(text);
      throw new LlmExeError(
        `Invalid input. Expected string. Received ${received}.`,
        "parser.parse_failed",
        {
          operation: "StringExtractParser.parse",
          parser: "stringExtract",
          reason: "invalid_input_type",
          expected: "string",
          received,
        }
      );
    }

    if (this.enum.length === 0) {
      throw new LlmExeError(
        `No enum values configured.`,
        "parser.parse_failed",
        {
          operation: "StringExtractParser.parse",
          parser: "stringExtract",
          reason: "no_enum_values",
          expected: "non-empty enum",
          inputLength: text.length,
        }
      );
    }

    if (text.length === 0) {
      if (this.enum.includes("")) {
        return "";
      }

      throw new LlmExeError(
        `No matching enum value found in input.`,
        "parser.parse_failed",
        {
          operation: "StringExtractParser.parse",
          parser: "stringExtract",
          reason: "empty_input",
          expected: this.enum,
          inputLength: text.length,
        }
      );
    }

    const matches = this.findMatches(text);
    const uniqueMatches = Array.from(new Set(matches));

    if (uniqueMatches.length === 1) {
      return uniqueMatches[0];
    }

    if (uniqueMatches.length > 1) {
      throw new LlmExeError(
        `Multiple enum values found in input.`,
        "parser.parse_failed",
        {
          operation: "StringExtractParser.parse",
          parser: "stringExtract",
          reason: "ambiguous_enum_match",
          expected: this.enum,
          match: this.match,
          inputLength: text.length,
          matchCount: uniqueMatches.length,
        }
      );
    }

    throw new LlmExeError(
      `No matching enum value found in input.`,
      "parser.parse_failed",
      {
        operation: "StringExtractParser.parse",
        parser: "stringExtract",
        reason: "no_enum_match",
        expected: this.enum,
        match: this.match,
        inputLength: text.length,
      }
    );
  }

  private findMatches(text: string): string[] {
    switch (this.match) {
      case "whole":
        return this.matchWhole(text);
      case "substring":
        return this.matchSubstring(text);
      case "word":
      default:
        return this.matchWord(text);
    }
  }

  private matchWhole(text: string): string[] {
    const candidate = this.ignoreCase ? text.trim().toLowerCase() : text.trim();
    return this.enum.filter((option) => {
      if (option === "") return false;
      const normalized = this.ignoreCase ? option.toLowerCase() : option;
      return candidate === normalized;
    });
  }

  private matchSubstring(text: string): string[] {
    const haystack = this.ignoreCase ? text.toLowerCase() : text;
    return this.enum.filter((option) => {
      if (option === "") return false;
      const needle = this.ignoreCase ? option.toLowerCase() : option;
      return haystack.includes(needle);
    });
  }

  private matchWord(text: string): string[] {
    const flags = this.ignoreCase ? "iu" : "u";
    return this.enum.filter((option) => {
      if (option === "") return false;
      const pattern = new RegExp(
        `(?<!${WORD_CHAR})${escapeRegex(option)}(?!${WORD_CHAR})`,
        flags
      );
      return pattern.test(text);
    });
  }
}
