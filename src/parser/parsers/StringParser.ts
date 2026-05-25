import { BaseParser, ParserInput } from "../_base";
import { BaseParserOptions } from "@/types";
import { LlmExeError } from "@/utils/modules/errors";

export interface StringParserOptions extends BaseParserOptions {}

/**
 * v3 parser contract:
 * Category: pass-through
 * Mode: string pass-through
 *
 * Accepts any string and returns it exactly.
 * Throws LlmExeError(parser.parse_failed) for non-string input.
 * Executor output normalization owns OutputResult handling before parser
 * invocation.
 *
 */
export class StringParser extends BaseParser<string> {
  constructor(options?: StringParserOptions) {
    super("string", options);
  }

  parse(text: ParserInput, _options?: Record<string, any>) {
    if (typeof text !== "string") {
      throw new LlmExeError(
        `Invalid input. Expected string. Received ${text === null ? "null" : Array.isArray(text) ? "array" : typeof text}.`,
        "parser.parse_failed",
        {
          operation: "StringParser.parse",
          parser: "string",
          reason: "invalid_input_type",
          expected: "string",
          received:
            text === null
              ? "null"
              : Array.isArray(text)
                ? "array"
                : typeof text,
        },
      );
    }

    return text;
  }
}
