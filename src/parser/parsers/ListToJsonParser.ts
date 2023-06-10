import { camelCase } from '@/utils';
import { BaseParserOptionsWithSchema } from "@/types";
import { BaseParser } from "../_base";
import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { enforceParserSchema, validateParserSchema } from '../_utils';

export class ListToJsonParser<
  S extends JSONSchema | undefined = undefined,
  T = S extends JSONSchema ? FromSchema<S> : Record<string, any>
> extends BaseParser<T> {
  constructor(options?: BaseParserOptionsWithSchema<S>) {
    super("listToJson", options);
  }
  parse(text: string): T {
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
      if(this?.options?.validateSchema){
        const valid = validateParserSchema(this.schema, parsed);
        if(valid && valid.length){
          throw new Error(valid[0].message)
        }
      }
      return parsed
    }
    return output;
  }
}
