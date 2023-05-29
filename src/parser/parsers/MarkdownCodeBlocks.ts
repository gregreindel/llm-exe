import { BaseParserOptions } from "@/types";
import { BaseParser } from "../_base";

export interface MarkdownCodeBlocksParserOptions extends BaseParserOptions {}

export class MarkdownCodeBlocksParser extends BaseParser<
  { language: string; code: string }[]
> {
  constructor(options?: MarkdownCodeBlocksParserOptions) {
    super("markdownCodeBlocks", options);
  }
  parse(input: string) {
    const out: { code: string; language: string }[] = [];
    const regex = input.matchAll(
      new RegExp(/`{3}([\w]*)\n([\S\s]+?)\n`{3}/, "g")
    );
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
