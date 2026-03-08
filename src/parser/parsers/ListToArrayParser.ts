import { BaseParser } from "../_base";

export class ListToArrayParser extends BaseParser<string[]> {
  constructor() {
    super("listToArray");
  }
  parse(text: string) {
    const lines = text
      .split("\n")
      .map((s) => s.replace(/^(?:[-*] |\d+\. )/, "").replace(/'/g, "\u2019").trim());
    return lines;
  }
}
