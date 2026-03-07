import { BaseParser } from "../_base";

export class ListToArrayParser extends BaseParser<string[]> {
  constructor() {
    super("listToArray");
  }
  parse(text: string) {
    const lines = text
      .split("\n")
      .map((s) => s.replace(/^(?:\d+[.)]\s+|[-*]\s+)/, "").replace(/\u2019/g, "'").trim());
    return lines;
  }
}
