import { assert } from "@/utils/modules/assert";
import { BaseParser } from "../_base";
import { BaseParserOptions, OutputResultContent } from "@/types";

export interface StringParserOptions extends BaseParserOptions {}

export class StringParser extends BaseParser<string> {
  constructor(options?: StringParserOptions) {
    super("string", options);
  }
  parse(text: string | OutputResultContent[], _options?: Record<string, any>) {
    assert(
      typeof text === "string",
      `Invalid input. Expected string. Received ${typeof text}.`
    );
    const parsed = text.toString();
    return parsed;
  }
}
