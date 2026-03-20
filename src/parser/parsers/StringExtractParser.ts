import { assert } from "@/utils/modules/assert";
import { LlmExeError } from "@/utils/modules/errors";
import { BaseParser } from "../_base";
import { BaseParserOptions } from "@/types";

export interface StringExtractParserOptions extends BaseParserOptions {
  enum: string[];
  ignoreCase?: boolean;
}

export class StringExtractParser extends BaseParser<string> {
  private enum: string[] = [];
  private ignoreCase: boolean;

  constructor(options?: StringExtractParserOptions) {
    super("stringExtract", options);
    if (options?.enum) {
      this.enum.push(...options.enum);
    }
    if (options?.ignoreCase) {
      this.ignoreCase = true;
    }
  }
  parse(text: string) {
    assert(
      typeof text === "string",
      `Invalid input. Expected string. Received ${typeof text}.`
    );
    for (const option of this.enum) {
      const regex = this.ignoreCase
        ? new RegExp(option.toLowerCase(), "i")
        : new RegExp(option);
      if (regex.test(text)) {
        return option;
      }
    }
    throw new LlmExeError(
      `No matching value found. Expected one of: ${this.enum.join(", ")}`,
      "parser",
      {
        parser: "stringExtract",
        output: text,
        error: `No matching value found. Expected one of: ${this.enum.join(", ")}`,
      }
    );
  }
}
