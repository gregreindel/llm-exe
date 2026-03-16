import { camelCase } from "@/utils/modules/camelCase";
import { BaseParserOptionsWithSchema, ParserOutput } from "@/types";
import { BaseParserWithJson } from "../_base";
import { JSONSchema } from "json-schema-to-ts";
import { enforceParserSchema, validateParserSchema } from "../_utils";
import { LlmExeError } from "@/utils/modules/errors";

export interface ListToJsonParserOptions<
  S extends JSONSchema | undefined = undefined
> extends BaseParserOptionsWithSchema<S> {
  keyTransform?: "camelCase" | "preserve";
}

export class ListToJsonParser<
  S extends JSONSchema | undefined = undefined
> extends BaseParserWithJson<S> {
  private keyTransform: "camelCase" | "preserve";
  constructor(options: ListToJsonParserOptions<S> = {}) {
    super("listToJson", options);
    this.keyTransform = options.keyTransform ?? "camelCase";
  }
  parse(text: string): ParserOutput<BaseParserWithJson<S>> {
    const lines = text.split("\n");
    const output: any = {};
    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex);
        const value = line.slice(colonIndex + 1).trim();
        if (value) {
          const transformedKey =
            this.keyTransform === "preserve" ? key.trim() : camelCase(key);
          output[transformedKey] = value;
        }
      }
    });
    if (this.schema) {
      const parsed = enforceParserSchema(this.schema, output);
      if (this?.validateSchema) {
        const valid = validateParserSchema(this.schema, parsed);
        if (valid && valid.length) {
          throw new LlmExeError(valid[0].message, "parser", {
            parser: "json",
            output: parsed,
            error: valid[0].message,
          });
        }
      }
      return parsed;
    }
    return output;
  }
}
