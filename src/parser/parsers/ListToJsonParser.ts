import { BaseParserOptionsWithSchema } from "@/types";
import { BaseParser } from "../_base";
import { FromSchema, JSONSchema } from "json-schema-to-ts";

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
        output[key.trim().toLowerCase()] = value.trim();
      }
    });
    if (this.schema) {
      return this.enforceSchema(output);
    }
    return output;
  }
}
