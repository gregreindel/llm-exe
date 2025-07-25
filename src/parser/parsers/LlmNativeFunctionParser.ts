import {
  BaseParserOptions,
  OutputResult,
  OutputResultContent,
  ParserOutput,
} from "@/types";
import { BaseParser } from "../_base";

import { maybeParseJSON } from "@/utils";

export interface LlmNativeFunctionParserOptions<T extends BaseParser<any>>
  extends BaseParserOptions {
  parser: T;
}

export class LlmFunctionParser<T extends BaseParser<any>> extends BaseParser<
  ParserOutput<T> | OutputResultContent[]
> {
  public parser: T;

  constructor(options: LlmNativeFunctionParserOptions<T>) {
    // pass the `function_call` target through so the executor knows
    super("functionCall", options, "function_call");
    this.parser = options.parser;
  }
  parse(text: OutputResult, _options?: Record<string, any>) {
    if (typeof text === "string") {
      return this.parser.parse(text) as ParserOutput<T>;
    }
    const { content } = text;
    const functionUses =
      content?.filter((a) => a.type === "function_use") || [];

    if (functionUses.length === 0) {
      const [item] = content;
      return this.parser.parse(item.text!) as ParserOutput<T>;
    }

    // we pass the output response through, its been formatted by output
    return content as OutputResultContent[];
  }
}

export interface LlmNativeFunctionParserOptions<T extends BaseParser<any>>
  extends BaseParserOptions {
  parser: T;
}

/**
 * @deprecated Use `LlmFunctionParser` instead.
 */
export class LlmNativeFunctionParser<
  T extends BaseParser<any>,
> extends BaseParser<ParserOutput<T> | { name: any; arguments: any }> {
  public parser: T;

  constructor(options: LlmNativeFunctionParserOptions<T>) {
    // pass the `function_call` target through so the executor knows
    super("openAiFunction", options, "function_call");
    this.parser = options.parser;
  }
  parse(text: OutputResult, _options?: Record<string, any>) {
    const { content } = text;
    const functionUse = content?.find((a) => a.type === "function_use");
    if (functionUse && "name" in functionUse && "input" in functionUse) {
      return {
        name: functionUse.name,
        arguments: maybeParseJSON(functionUse.input),
      };
    }

    return this.parser.parse(text) as ParserOutput<T>;
  }
}

/**
 * @deprecated Use `LlmExecutorWithFunctions` instead.
 */
export const OpenAiFunctionParser = LlmNativeFunctionParser;
