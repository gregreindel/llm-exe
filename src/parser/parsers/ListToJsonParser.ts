import { camelCase } from "@/utils/modules/camelCase";
import { BaseParserOptionsWithSchema, ParserOutput } from "@/types";
import { BaseParserWithJson } from "../_base";
import { JSONSchema } from "json-schema-to-ts";
import { enforceParserSchema, validateParserSchema } from "../_utils";
import { LlmExeError } from "@/utils/modules/errors";

export class ListToJsonParser<
  S extends JSONSchema | undefined = undefined
> extends BaseParserWithJson<S> {
  constructor(options: BaseParserOptionsWithSchema<S> = {}) {
    super("listToJson", options);
  }
  parse(text: string): ParserOutput<BaseParserWithJson<S>> {
    const lines = text.split("\n");
    const output: any = {};
    lines.forEach((line) => {
      const [key, value] = line.split(":");
      if (value) {
        output[camelCase(key)] = value.trim();
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
