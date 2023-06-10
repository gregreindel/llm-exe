import { maybeParseJSON } from "@/utils";
import { BaseParser } from "../_base";
import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { BaseParserOptionsWithSchema } from "@/types";
import { enforceParserSchema, validateParserSchema } from "../_utils";

export class JsonParser<
  S extends JSONSchema | undefined = undefined,
  T = S extends JSONSchema ? FromSchema<S> : Record<string, any>
> extends BaseParser<T> {
  constructor(options?: BaseParserOptionsWithSchema<S>) {
    super("json", options);
  }

  parse(text: string): T {
    const parsed = maybeParseJSON<T>(text);
    if (this.schema) {
      const enforce = enforceParserSchema(this.schema, parsed);
      if(this?.options?.validateSchema){
        const valid = validateParserSchema(this.schema, enforce as any);
        if(valid && valid.length){
          throw new Error(valid[0].message)
        }
      }
      return enforce
    }
    return parsed
  }
}
