import { assert } from "@/utils";
import { BaseParser } from "../_base";
import { BaseParserOptions } from "@/types";

export interface StringExtractParserOptions extends BaseParserOptions {
  enum: string[];
}

export class StringExtractParser extends BaseParser<string> {
  private enum: (string | RegExp)[] = [];

  constructor(options?: StringExtractParserOptions) {
    super("stringExtract", options);
    if (options?.enum) {
      this.enum.push(...options.enum);
    }
  }
  parse(text: string) {
    assert(
      typeof text === "string",
      `Invalid input. Expected string. Received ${typeof text}.`
    );
    for (const option of this.enum) {
      const match = this.findWord(option, text)
      if (match) {
        return match;
      }
    }
    return "";
  }
  findWord(needle: string | RegExp, haystack: string) {
    if (!needle || !haystack) return "";
    if(typeof needle === "string"){
      const match = haystack.match(RegExp(needle))
      return match ? match[0] : "";
    }else if(needle instanceof RegExp){
      const match = haystack.toLowerCase().match(needle)
      return match ? match[0] : "";
    }
    return "";
  }
}