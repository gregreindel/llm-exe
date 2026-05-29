import { camelCase } from "@/utils/modules/camelCase";
import { ParserOutput } from "@/types";
import { BaseParserWithJson } from "../_base";
import { JSONSchema } from "json-schema-to-ts";
import {
  applyParserSchemaDefaultsAndFilter,
  coerceParserSchemaValues,
  validateParserSchema,
} from "../_utils";
import { LlmExeError } from "@/errors";
import { normalizeListLines } from "../_listBoundary";
import { JsonParserOptions } from "@/interfaces";

export interface ListToObjectParserOptions<
  S extends JSONSchema | undefined = undefined,
> extends JsonParserOptions<S> {
  keyTransform?: "preserve" | "camelCase";
}

export class ListToObjectParser<
  S extends JSONSchema | undefined = undefined
> extends BaseParserWithJson<S> {
  private keyTransform: "preserve" | "camelCase";
  private shouldValidateSchema: boolean;

  constructor(options: ListToObjectParserOptions<S> = {}) {
    super("listToObject", options);
    this.keyTransform = options.keyTransform ?? "preserve";
    this.shouldValidateSchema = !!options.schema && options.validateSchema !== false;
  }

  /**
   * v3 parser contract:
   * Category: converter
   * Mode: line-oriented format conversion
   *
   * Uses the shared list boundary. Parses normalized lines as key/value pairs
   * split at the first colon. Returns a Record<string, string>. Throws on
   * duplicate keys (object output would silently lose data). Keys are
   * preserved as written by default; pass keyTransform: "camelCase" for the
   * legacy listToJson behavior.
   */
  parse(text: string): ParserOutput<BaseParserWithJson<S>> {
    if (typeof text !== "string") {
      throw new LlmExeError(
        `Invalid input. Expected string. Received ${text === null ? "null" : Array.isArray(text) ? "array" : typeof text}.`,
        {
          code: "parser.invalid_input",
          context: {
            operation: "ListToObjectParser.parse",
            parser: "listToObject",
            reason: "invalid_input_type",
            expected: "string",
            received: text === null ? "null" : Array.isArray(text) ? "array" : typeof text,
          },
        }
      );
    }

    const { lines } = normalizeListLines(text, {
      operation: "ListToObjectParser.parse",
      parser: "listToObject",
    });

    const output: any = {};
    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        throw new LlmExeError(`Malformed key/value line.`, {
          code: "parser.parse_failed",
          context: {
            operation: "ListToObjectParser.parse",
            parser: "listToObject",
            reason: "malformed_line",
            inputLength: text.length,
          },
        });
      }

      const key = line.slice(0, colonIndex).trim();
      if (!key) {
        throw new LlmExeError(`Empty key in key/value line.`, {
          code: "parser.parse_failed",
          context: {
            operation: "ListToObjectParser.parse",
            parser: "listToObject",
            reason: "empty_key",
            inputLength: text.length,
          },
        });
      }

      const transformedKey =
        this.keyTransform === "camelCase" ? camelCase(key) : key;
      if (Object.prototype.hasOwnProperty.call(output, transformedKey)) {
        throw new LlmExeError(`Duplicate key in key/value input.`, {
          code: "parser.parse_failed",
          context: {
            operation: "ListToObjectParser.parse",
            parser: "listToObject",
            reason: "duplicate_key",
            inputLength: text.length,
          },
        });
      }

      output[transformedKey] = line.slice(colonIndex + 1).trim();
    });
    if (this.schema) {
      const coerced = coerceParserSchemaValues(this.schema, output);
      if (this.shouldValidateSchema) {
        const valid = validateParserSchema(this.schema, coerced);
        if (valid && valid.length) {
          throw new LlmExeError(valid[0].message, {
            code: "parser.schema_validation_failed",
            context: {
              operation: "ListToObjectParser.parse",
              parser: "listToObject",
              schemaErrors: valid.map((error) => error.message),
            },
          });
        }
      }
      return applyParserSchemaDefaultsAndFilter(this.schema, coerced);
    }
    return output;
  }
}
