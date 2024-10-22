import { assert } from "@/utils/modules/assert";
import { BaseParser } from "../_base";
import { BaseParserOptions } from "@/types";

export interface BooleanParserOptions extends BaseParserOptions {}

export class BooleanParser extends BaseParser<boolean> {
  constructor(options?: BooleanParserOptions) {
    super("boolean", options);
  }
  parse(text: string) {
    assert(
      typeof text === "string",
      `Invalid input. Expected string. Received ${typeof text}.`
    );
    const clean = text.toLowerCase().trim();
    if (clean === "true") {
      return true;
    }
    return false;
  }
}
