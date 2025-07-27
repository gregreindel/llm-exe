import { assert } from "@/utils/modules/assert";
import { BaseParser } from "../_base";
import { BaseParserOptions, OutputResult } from "@/types";
import { isOutputResult } from "@/utils/guards";

export interface StringParserOptions extends BaseParserOptions {}

export class StringParser extends BaseParser<string> {
  constructor(options?: StringParserOptions) {
    super("string", options);
  }
  parse(text: string | OutputResult, _options?: Record<string, any>) {
    if (isOutputResult(text)) {
      return text.content?.[0]?.text ?? "";
    }

    assert(
      typeof text === "string",
      `Invalid input. Expected string. Received ${typeof text}.`
    );
    const parsed = text.toString();
    return parsed;
  }
}
