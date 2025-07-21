import { BaseParserOptions, OutputResultContent, ParserOutput } from "@/types";
import { BaseParser } from "../_base";
import { maybeParseJSON } from "@/utils";
import { getResultText } from "@/llm/output/_utils/getResultText";

export interface LlmNativeFunctionParserOptions<T extends BaseParser<any>>
  extends BaseParserOptions {
  parser: T;
}

export class LlmNativeFunctionParser<
  T extends BaseParser<any>,
> extends BaseParser<ParserOutput<T> | { name: any; arguments: any }> {
  public parser: T;

  constructor(options: LlmNativeFunctionParserOptions<T>) {
    super("openAiFunction", options, "function_call");
    this.parser = options.parser;
  }
  parse(text: OutputResultContent[], _options?: Record<string, any>) {
    const functionUse = text?.find((a) => a.type === "function_use");
    if (functionUse && "name" in functionUse && "input" in functionUse) {
      return {
        name: functionUse.name,
        arguments: maybeParseJSON(functionUse.input),
      };
    }

    return this.parser.parse(getResultText(text)) as ParserOutput<T>;
  }
}

/**
 * @deprecated Use `LlmExecutorWithFunctions` instead.
 */
export const OpenAiFunctionParser = LlmNativeFunctionParser;
