import { maybeParseJSON } from "@/utils";
import { BaseParserWithJson } from "../_base";
import { JSONSchema } from "json-schema-to-ts";
import { BaseParserOptionsWithSchema, ParserOutput } from "@/types";
import { enforceParserSchema, validateParserSchema } from "../_utils";
import { helpJsonMarkup } from "@/utils/modules/json";
import { LlmExeError } from "@/errors";

export class JsonParser<
  S extends JSONSchema | undefined = undefined
> extends BaseParserWithJson<S> {
  constructor(options: BaseParserOptionsWithSchema<S> = {}) {
    super("json", options);
  }

  parse(
    text: string,
    _attributes?: Record<string, any>
  ): ParserOutput<BaseParserWithJson<S>> {
    const parsed = maybeParseJSON(helpJsonMarkup(text));
    if (this.schema) {
      const enforce = enforceParserSchema(this.schema, parsed);
      if (this.validateSchema) {
        const valid = validateParserSchema(this.schema, enforce as any);
        if (valid && valid.length) {
          throw new LlmExeError(valid[0].message, {
            code: "parser.schema_validation_failed",
            context: {
              operation: "JsonParser.parse",
              parser: "json",
              output: parsed,
              schemaErrors: valid,
            },
          });
        }
      }
      return enforce;
    }
    return parsed;
  }
}
