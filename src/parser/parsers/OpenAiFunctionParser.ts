import { BaseParserOptions, ParserOutput } from "@/types";
import { BaseParser } from "../_base";
import { maybeParseJSON } from "@/utils";

export interface OpenAiFunctionParserOptions<T extends BaseParser<any>>
  extends BaseParserOptions {
  parser: T;
}

export class OpenAiFunctionParser<T extends BaseParser<any>> extends BaseParser<
  ParserOutput<T> | { name: any; arguments: any }
> {
  public parser: T;

  constructor(options: OpenAiFunctionParserOptions<T>) {
    super("openAiFunction", options);
    this.parser = options.parser;
  }
  parse(text: string) {
    const isFunctionCall = maybeParseJSON(text);
    if (
      typeof isFunctionCall === "object" &&
      isFunctionCall?.function_call &&
      "name" in isFunctionCall.function_call &&
      "arguments" in isFunctionCall.function_call
    ) {
      return {
        name: isFunctionCall.function_call.name,
        arguments: maybeParseJSON(isFunctionCall.function_call.arguments),
      };
    }

    return this.parser.parse(text) as ParserOutput<T>;
  }
}
