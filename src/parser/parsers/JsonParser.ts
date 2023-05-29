import { maybeParseJSON } from "@/utils";
import { BaseParser } from "../_base";
import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { BaseParserOptionsWithSchema } from "@/types";

export class JsonParser<
  S extends JSONSchema | undefined = undefined,
  T = S extends JSONSchema ? FromSchema<S> : Record<string, any>
> extends BaseParser<T> {
  constructor(options?: BaseParserOptionsWithSchema<S>) {
    super("json", options);
  }

  parse(text: string): T {
    return maybeParseJSON<T>(text);
  }
}
