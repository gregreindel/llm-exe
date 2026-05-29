import { BaseParser } from "../_base";
import { LlmExeError } from "@/errors";
import { normalizeListLines } from "../_listBoundary";
import { camelCase } from "@/utils/modules/camelCase";

export interface ListToEntriesParserOptions {
  keyTransform?: "preserve" | "camelCase";
}

export class ListToEntriesParser extends BaseParser<Array<[string, string]>> {
  private keyTransform: "preserve" | "camelCase";

  constructor(options?: ListToEntriesParserOptions) {
    super("listToEntries");
    this.keyTransform = options?.keyTransform ?? "preserve";
  }

  /**
   * v3 parser contract:
   * Category: converter
   * Mode: line-oriented collector
   *
   * Uses the shared list boundary. Parses normalized lines as key/value pairs
   * split at the first colon. Returns Array<[key, value]> tuples matching
   * Object.entries() semantics. Preserves duplicate keys and order.
   */
  parse(text: string, _attributes?: Record<string, any>): Array<[string, string]> {
    if (typeof text !== "string") {
      throw new LlmExeError(
        `Invalid input. Expected string. Received ${text === null ? "null" : Array.isArray(text) ? "array" : typeof text}.`,
        {
          code: "parser.invalid_input",
          context: {
            operation: "ListToEntriesParser.parse",
            parser: "listToEntries",
            reason: "invalid_input_type",
            expected: "string",
            received: text === null ? "null" : Array.isArray(text) ? "array" : typeof text,
          },
        }
      );
    }

    const { lines } = normalizeListLines(text, {
      operation: "ListToEntriesParser.parse",
      parser: "listToEntries",
    });

    const res: Array<[string, string]> = [];
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        throw new LlmExeError(`Malformed key/value line.`, {
          code: "parser.parse_failed",
          context: {
            operation: "ListToEntriesParser.parse",
            parser: "listToEntries",
            reason: "malformed_line",
            inputLength: text.length,
          },
        });
      }

      const rawKey = line.slice(0, colonIndex).trim();
      if (!rawKey) {
        throw new LlmExeError(`Empty key in key/value line.`, {
          code: "parser.parse_failed",
          context: {
            operation: "ListToEntriesParser.parse",
            parser: "listToEntries",
            reason: "empty_key",
            inputLength: text.length,
          },
        });
      }

      const key =
        this.keyTransform === "camelCase" ? camelCase(rawKey) : rawKey;
      res.push([key, line.slice(colonIndex + 1).trim()]);
    }
    return res;
  }
}
