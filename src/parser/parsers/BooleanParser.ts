import { BaseParser } from "../_base";
import { BaseParserOptions } from "@/types";
import { LlmExeError } from "@/utils/modules/errors";
import { isDebugEnabled } from "@/utils/modules/debug";

export interface BooleanParserOptions extends BaseParserOptions {}

const BOOLEAN_VALUES = ["true", "false", "yes", "no", "y", "n", "1", "0"];
const TRUTHY_VALUES = new Set(["true", "yes", "y", "1"]);
const FALSY_VALUES = new Set(["false", "no", "n", "0"]);
const MAX_ERROR_INPUT_EXCERPT_LENGTH = 500;

/**
 * v3 parser contract:
 * Category: strict
 * Mode: whole-output
 *
 * Accepts only documented boolean literals after trim/lowercase.
 * Returns true/false only when input is recognized.
 * Throws LlmExeError(parser.parse_failed) for empty, invalid-type, or
 * unrecognized input. Does not extract booleans from prose.
 * Error context does not include input content unless LLM_EXE_DEBUG is enabled.
 *
 */
export class BooleanParser extends BaseParser<boolean> {
  constructor(options?: BooleanParserOptions) {
    super("boolean", options);
  }

  private getInputErrorContext(text: string) {
    const context: {
      inputLength: number;
      inputExcerpt?: string;
      inputExcerptTruncated?: boolean;
    } = {
      inputLength: text.length,
    };

    if (isDebugEnabled()) {
      const truncated = text.length > MAX_ERROR_INPUT_EXCERPT_LENGTH;
      context.inputExcerpt = truncated
        ? text.slice(0, MAX_ERROR_INPUT_EXCERPT_LENGTH)
        : text;
      context.inputExcerptTruncated = truncated;
    }

    return context;
  }

  parse(text: string) {
    if (typeof text !== "string") {
      throw new LlmExeError(
        `Invalid input. Expected string. Received ${text === null ? "null" : typeof text}.`,
        "parser.parse_failed",
        {
          operation: "BooleanParser.parse",
          parser: "boolean",
          reason: "invalid_input_type",
          expected: "string",
          received: text === null ? "null" : typeof text,
        }
      );
    }

    const clean = text.toLowerCase().trim();
    if (!clean) {
      throw new LlmExeError(`No boolean value found in input.`, "parser.parse_failed", {
        operation: "BooleanParser.parse",
        parser: "boolean",
        reason: "empty_input",
        expected: BOOLEAN_VALUES,
        ...this.getInputErrorContext(text),
      });
    }

    if (TRUTHY_VALUES.has(clean)) {
      return true;
    }
    if (FALSY_VALUES.has(clean)) {
      return false;
    }

    throw new LlmExeError(`No boolean value found in input.`, "parser.parse_failed", {
      operation: "BooleanParser.parse",
      parser: "boolean",
      reason: "unrecognized_boolean",
      expected: BOOLEAN_VALUES,
      ...this.getInputErrorContext(text),
    });
  }
}
