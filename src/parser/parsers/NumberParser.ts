import { BaseParser } from "../_base";
import { isFinite } from "@/utils/modules/isFinite";
import { toNumber } from "@/utils/modules/toNumber";
import { LlmExeError } from "@/utils/modules/errors";

export type NumberParserMatch = "extract" | "whole";

export interface NumberParserOptions {
  match?: NumberParserMatch;
}

const NUMERIC_TOKEN_PATTERN =
  /(^|[^\w.])([+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)(?![\w,])/g;
const WHOLE_NUMERIC_PATTERN =
  /^[+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/**
 * v3 parser contract:
 * Category: extractor
 * Mode: numeric token extraction
 *
 * Extracts one documented numeric token from text. Pass match: "whole" to
 * require the input to consist of exactly one numeric token (after trim) with
 * no surrounding prose.
 *
 * Throws LlmExeError(parser.parse_failed) for empty input, no numeric token,
 * multiple numeric tokens, invalid conversion, or invalid input type.
 */
export class NumberParser extends BaseParser<number> {
  private match: NumberParserMatch;

  constructor(options?: NumberParserOptions) {
    super("number");
    this.match = options?.match ?? "extract";
  }

  parse(text: string, _attributes?: Record<string, any>) {
    if (typeof text !== "string") {
      throw new LlmExeError(
        `Invalid input. Expected string. Received ${text === null ? "null" : Array.isArray(text) ? "array" : typeof text}.`,
        "parser.parse_failed",
        {
          operation: "NumberParser.parse",
          parser: "number",
          reason: "invalid_input_type",
          expected: "string",
          received: text === null ? "null" : Array.isArray(text) ? "array" : typeof text,
        }
      );
    }

    if (text.trim() === "") {
      throw new LlmExeError(`No numeric value found in input.`, "parser.parse_failed", {
        operation: "NumberParser.parse",
        parser: "number",
        reason: "empty_input",
        expected: "number",
        inputLength: text.length,
      });
    }

    if (this.match === "whole") {
      const trimmed = text.trim();
      if (!WHOLE_NUMERIC_PATTERN.test(trimmed)) {
        throw new LlmExeError(
          `Input is not a whole numeric value.`,
          "parser.parse_failed",
          {
            operation: "NumberParser.parse",
            parser: "number",
            reason: "no_numeric_value",
            expected: "whole number",
            match: this.match,
            inputLength: text.length,
          }
        );
      }

      const value = toNumber(trimmed.replace(/,/g, ""));
      if (!isFinite(value)) {
        throw new LlmExeError(
          `Invalid numeric value found in input.`,
          "parser.parse_failed",
          {
            operation: "NumberParser.parse",
            parser: "number",
            reason: "invalid_number",
            expected: "finite number",
            match: this.match,
            inputLength: text.length,
          }
        );
      }
      return value;
    }

    const matches = Array.from(text.matchAll(NUMERIC_TOKEN_PATTERN)).map(
      (match) => match[2]
    );

    if (matches.length === 0) {
      throw new LlmExeError(`No numeric value found in input.`, "parser.parse_failed", {
        operation: "NumberParser.parse",
        parser: "number",
        reason: "no_numeric_value",
        expected: "number",
        match: this.match,
        inputLength: text.length,
      });
    }

    if (matches.length > 1) {
      throw new LlmExeError(`Multiple numeric values found in input.`, "parser.parse_failed", {
        operation: "NumberParser.parse",
        parser: "number",
        reason: "ambiguous_number",
        expected: "one numeric value",
        match: this.match,
        inputLength: text.length,
        matchCount: matches.length,
      });
    }

    const value = toNumber(matches[0].replace(/,/g, ""));
    if (!isFinite(value)) {
      throw new LlmExeError(`Invalid numeric value found in input.`, "parser.parse_failed", {
        operation: "NumberParser.parse",
        parser: "number",
        reason: "invalid_number",
        expected: "finite number",
        match: this.match,
        inputLength: text.length,
      });
    }

    return value;
  }
}
