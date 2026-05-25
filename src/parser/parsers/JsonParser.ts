import { BaseParserWithJson } from "../_base";
import { JSONSchema } from "json-schema-to-ts";
import { BaseParserOptionsWithSchema, ParserOutput } from "@/types";
import { enforceParserSchema, validateParserSchema } from "../_utils";
import { LlmExeError } from "@/utils/modules/errors";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeWholeResponseJsonText(input: string) {
  const trimmed = input.trim();
  const fenceMatch = trimmed.match(/^```([a-zA-Z]*)[^\S\r\n]*\r?\n([\s\S]*)```$/);

  if (!fenceMatch) {
    return trimmed;
  }

  const [, language, body] = fenceMatch;
  if (language && language.toLowerCase() !== "json") {
    return trimmed;
  }

  return body.trim();
}

export class JsonParser<
  S extends JSONSchema | undefined = undefined
> extends BaseParserWithJson<S> {
  private shouldValidateSchema: boolean;

  constructor(options: BaseParserOptionsWithSchema<S> = {}) {
    super("json", options);
    this.shouldValidateSchema = !!options.schema && options.validateSchema !== false;
  }

  /**
   * v3 parser contract:
   * Category: strict
   * Mode: whole-output
   *
   * Parses strict JSON object/array output only. Invalid JSON, empty input,
   * JSON primitives, and non-plain runtime objects throw typed parser errors.
   * Schema validation is on by default when a schema is provided unless
   * validateSchema: false is explicitly set.
   *
   */
  parse(
    text: unknown,
    _attributes?: Record<string, any>
  ): ParserOutput<BaseParserWithJson<S>> {
    let parsed: unknown;
    let inputLength: number | undefined;

    if (typeof text === "string") {
      inputLength = text.length;
      if (text.trim() === "") {
        throw new LlmExeError(`No JSON value found in input.`, "parser.parse_failed", {
          operation: "JsonParser.parse",
          parser: "json",
          reason: "empty_input",
          expected: "JSON object or array",
          inputLength,
        });
      }

      try {
        parsed = JSON.parse(normalizeWholeResponseJsonText(text));
      } catch (cause) {
        const error = new LlmExeError(`Invalid JSON input.`, "parser.parse_failed", {
          operation: "JsonParser.parse",
          parser: "json",
          reason: "invalid_json",
          expected: "JSON object or array",
          inputLength,
        });
        (error as Error & { cause?: unknown }).cause = cause;
        throw error;
      }
    } else if (Array.isArray(text) || isPlainObject(text)) {
      parsed = text;
    } else {
      throw new LlmExeError(
        `Invalid input. Expected JSON string, plain object, or array. Received ${text === null ? "null" : typeof text}.`,
        "parser.parse_failed",
        {
          operation: "JsonParser.parse",
          parser: "json",
          reason: "invalid_input_type",
          expected: "JSON string, plain object, or array",
          received: text === null ? "null" : typeof text,
        }
      );
    }

    if (!Array.isArray(parsed) && !isPlainObject(parsed)) {
      throw new LlmExeError(`Invalid JSON root type.`, "parser.parse_failed", {
        operation: "JsonParser.parse",
        parser: "json",
        reason: "invalid_json_root_type",
        expected: "JSON object or array",
        received: parsed === null ? "null" : typeof parsed,
        inputLength,
      });
    }

    if (this.schema) {
      if (this.shouldValidateSchema) {
        const valid = validateParserSchema(this.schema, parsed as any);
        if (valid && valid.length) {
          throw new LlmExeError(valid[0].message, "parser.schema_validation_failed", {
            operation: "JsonParser.parse",
            parser: "json",
            reason: "schema_validation_failed",
            schemaErrors: valid.map((error) => error.message),
            inputLength,
          });
        }
      }
      const enforce = enforceParserSchema(this.schema, parsed);
      return enforce as ParserOutput<BaseParserWithJson<S>>;
    }
    return parsed as ParserOutput<BaseParserWithJson<S>>;
  }
}
