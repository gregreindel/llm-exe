import { BaseParserOptions } from "@/types";
import { BaseParser } from "../_base";
import { isFinite } from "@/utils/modules/isFinite";
import { toNumber } from "@/utils/modules/toNumber";
import { LlmExeError } from "@/errors";

export interface NumberParserOptions extends BaseParserOptions {}

export class NumberParser extends BaseParser<number> {
  constructor(options?: NumberParserOptions) {
    super("number", options);
  }
  parse(text: string) {
    const match = text.match(/-?\d+(\.\d+)?/);
    if (match && isFinite(toNumber(match[0]))) {
      return toNumber(match[0]);
    }
    throw new LlmExeError(`No numeric value found in input.`, {
      code: "parser.number_parse_failed",
      context: {
        operation: "NumberParser.parse",
        parser: "number",
        outputExcerpt: text,
        expected: "number",
      },
    });
  }
}
