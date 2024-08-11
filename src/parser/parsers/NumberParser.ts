import { BaseParserOptions } from "@/types";
import { BaseParser } from "../_base";
import { isFinite } from "@/utils/modules/isFinite";
import { toNumber } from "@/utils/modules/toNumber";

export interface NumberParserOptions extends BaseParserOptions {}

export class NumberParser extends BaseParser<number> {
  constructor(options?: NumberParserOptions) {
    super("number", options);
  }
  parse(text: string) {
    const match = text.match(/\d/g);
    return match && isFinite(toNumber(match[0])) ? toNumber(match[0]) : -1;
  }
}
