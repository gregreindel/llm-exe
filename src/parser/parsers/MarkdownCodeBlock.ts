import { BaseParserOptions } from "@/types";
import { MarkdownCodeBlocksParser } from "./MarkdownCodeBlocks";
import { BaseParser } from "../_base";

export interface MarkdownCodeBlockParserOptions extends BaseParserOptions {}

export class MarkdownCodeBlockParser extends BaseParser<{
  language: string;
  code: string;
}> {
  constructor(options?: MarkdownCodeBlockParserOptions) {
    super("markdownCodeBlock", options);
  }
  parse(input: string) {
    const [block] = new MarkdownCodeBlocksParser().parse(input);
    if (!block) {
      return {
        code: "",
        language: "",
      };
    }
    return block;
  }
}
