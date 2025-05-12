import { BaseParserOptions } from "@/types";
import { BaseParser } from "../_base";

export interface ListToKeyValueParserOptions extends BaseParserOptions {}

export class ListToKeyValueParser extends BaseParser<
  Array<{ key: string; value: string }>
> {
  constructor(options?: ListToKeyValueParserOptions) {
    super("listToKeyValue", options);
  }
  parse(text: string) {
    const lines = text
      .split("\n")
      .map((s) => s.replace("- ", "").replace(/'/g, "'"));

    let res: Array<{ key: string; value: string }> = [];
    for (const line of lines) {
      const [key, value] = line.split(":");
      if (key /** check more */ && value) {
        res.push({ key: key?.trim(), value: value?.trim() });
      }
    }
    return res;
  }
}
