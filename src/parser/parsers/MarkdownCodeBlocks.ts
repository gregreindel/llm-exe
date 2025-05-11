import { BaseParserOptions } from "@/types";
import { BaseParser } from "../_base";
import { isObjectStringified } from "@/utils";
import { singleKeyObjectToString } from "../singleKeyObjectToString";

export interface MarkdownCodeBlocksParserOptions extends BaseParserOptions {}

export class MarkdownCodeBlocksParser extends BaseParser<
  { language: string; code: string }[]
> {
  constructor(options?: MarkdownCodeBlocksParserOptions) {
    super("markdownCodeBlocks", options);
  }
  parse(input: string) {
    const out: { code: string; language: string }[] = [];

    // If input is JSON, decode it first
    // grok seems to want to return JSON code blocks
    // if others do, this can't hurt
    if (isObjectStringified(input)) {
      input = singleKeyObjectToString(input);
    }

    const regex = input.matchAll(new RegExp(/```(\w*)\n([\s\S]*?)```/, "g"));
    for (const iterator of regex) {
      if (iterator) {
        const [_input, language, code] = iterator;
        out.push({
          language,
          code,
        });
      }
    }
    return out;
  }
}
