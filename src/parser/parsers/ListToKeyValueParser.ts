import { BaseParserOptions } from "@/types";
import { BaseParser, ParserInput } from "../_base";
import { LlmExeError } from "@/utils/modules/errors";
import { normalizeListLines } from "../_listBoundary";

export interface ListToKeyValueParserOptions extends BaseParserOptions {}

export class ListToKeyValueParser extends BaseParser<
  Array<{ key: string; value: string }>
> {
  constructor(options?: ListToKeyValueParserOptions) {
    super("listToKeyValue", options);
  }
  /**
   * v3 parser contract:
   * Category: converter
   * Mode: line-oriented collector
   *
   * Uses the shared list boundary. Parses normalized lines as key/value pairs
   * split at the first colon. Preserves duplicate keys because output is an
   * ordered array.
   *
   */
  parse(text: ParserInput) {
    if (typeof text !== "string") {
      throw new LlmExeError(
        `Invalid input. Expected string. Received ${text === null ? "null" : Array.isArray(text) ? "array" : typeof text}.`,
        "parser.parse_failed",
        {
          operation: "ListToKeyValueParser.parse",
          parser: "listToKeyValue",
          reason: "invalid_input_type",
          expected: "string",
          received: text === null ? "null" : Array.isArray(text) ? "array" : typeof text,
        }
      );
    }

    const { lines } = normalizeListLines(text, {
      operation: "ListToKeyValueParser.parse",
      parser: "listToKeyValue",
    });

    let res: Array<{ key: string; value: string }> = [];
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        throw new LlmExeError(`Malformed key/value line.`, "parser.parse_failed", {
          operation: "ListToKeyValueParser.parse",
          parser: "listToKeyValue",
          reason: "malformed_line",
          inputLength: text.length,
        });
      }

      const key = line.slice(0, colonIndex).trim();
      if (!key) {
        throw new LlmExeError(`Empty key in key/value line.`, "parser.parse_failed", {
          operation: "ListToKeyValueParser.parse",
          parser: "listToKeyValue",
          reason: "empty_key",
          inputLength: text.length,
        });
      }

      res.push({ key, value: line.slice(colonIndex + 1).trim() });
    }
    return res;
  }
}
