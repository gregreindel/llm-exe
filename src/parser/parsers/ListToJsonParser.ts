import { camelCase } from "@/utils/modules/camelCase";
import { ListToJsonParserOptions, ParserOutput } from "@/types";
import { BaseParserWithJson } from "../_base";
import { JSONSchema } from "json-schema-to-ts";
import {
  applyParserSchemaDefaultsAndFilter,
  coerceParserSchemaValues,
  validateParserSchema,
} from "../_utils";
import { LlmExeError } from "@/utils/modules/errors";
import { normalizeListLines } from "../_listBoundary";

export class ListToJsonParser<
  S extends JSONSchema | undefined = undefined
> extends BaseParserWithJson<S> {
  private keyTransform: "camelCase" | "preserve";
  private shouldValidateSchema: boolean;

  constructor(options: ListToJsonParserOptions<S> = {}) {
    super("listToJson", options);
    this.keyTransform = options.keyTransform ?? "camelCase";
    this.shouldValidateSchema = !!options.schema && options.validateSchema !== false;
  }

  /**
   * v3 parser contract:
   * Category: converter
   * Mode: line-oriented format conversion
   *
   * Uses the shared list boundary. Parses normalized lines as key/value pairs
   * split at the first colon. Duplicate keys throw because object output would
   * overwrite data.
   *
   */
  parse(text: string): ParserOutput<BaseParserWithJson<S>> {
    if (typeof text !== "string") {
      throw new LlmExeError(
        `Invalid input. Expected string. Received ${text === null ? "null" : Array.isArray(text) ? "array" : typeof text}.`,
        "parser.parse_failed",
        {
          operation: "ListToJsonParser.parse",
          parser: "listToJson",
          reason: "invalid_input_type",
          expected: "string",
          received: text === null ? "null" : Array.isArray(text) ? "array" : typeof text,
        }
      );
    }

    const { lines } = normalizeListLines(text, {
      operation: "ListToJsonParser.parse",
      parser: "listToJson",
    });

    const output: any = {};
    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        throw new LlmExeError(`Malformed key/value line.`, "parser.parse_failed", {
          operation: "ListToJsonParser.parse",
          parser: "listToJson",
          reason: "malformed_line",
          inputLength: text.length,
        });
      }

      const key = line.slice(0, colonIndex).trim();
      if (!key) {
        throw new LlmExeError(`Empty key in key/value line.`, "parser.parse_failed", {
          operation: "ListToJsonParser.parse",
          parser: "listToJson",
          reason: "empty_key",
          inputLength: text.length,
        });
      }

      const transformedKey = this.keyTransform === "preserve" ? key : camelCase(key);
      if (Object.prototype.hasOwnProperty.call(output, transformedKey)) {
        throw new LlmExeError(`Duplicate key in key/value input.`, "parser.parse_failed", {
          operation: "ListToJsonParser.parse",
          parser: "listToJson",
          reason: "duplicate_key",
          inputLength: text.length,
        });
      }

      output[transformedKey] = line.slice(colonIndex + 1).trim();
    });
    if (this.schema) {
      const coerced = coerceParserSchemaValues(this.schema, output);
      if (this.shouldValidateSchema) {
        const valid = validateParserSchema(this.schema, coerced);
        if (valid && valid.length) {
          throw new LlmExeError(valid[0].message, "parser.schema_validation_failed", {
            operation: "ListToJsonParser.parse",
            parser: "listToJson",
            reason: "schema_validation_failed",
            schemaErrors: valid.map((error) => error.message),
            inputLength: text.length,
          });
        }
      }
      return applyParserSchemaDefaultsAndFilter(this.schema, coerced);
    }
    return output;
  }
}
