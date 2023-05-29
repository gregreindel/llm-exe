import { replaceTemplateString } from "@/utils";
import { BaseParser } from "../_base";
import { BaseParserOptions } from "@/types";
export interface ReplaceStringTemplateParserOptions extends BaseParserOptions {}

export class ReplaceStringTemplateParser extends BaseParser<string> {
  constructor(options?: ReplaceStringTemplateParserOptions) {
    super("replaceStringTemplate", options);
  }
  parse(text: string, attributes?: Record<string, any>) {
    return replaceTemplateString(text, attributes);
  }
}
