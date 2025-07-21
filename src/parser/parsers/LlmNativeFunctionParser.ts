import { BaseParserOptions, OutputResultContent, ParserOutput } from "@/types";
import { BaseParser } from "../_base";
import { maybeParseJSON } from "@/utils";
import { getResultText } from "@/llm/output/_utils/getResultText";

export interface LlmNativeFunctionParserOptions<T extends BaseParser<any>>
  extends BaseParserOptions {
  parser: T;
  multiple?: boolean; // Support for multiple function calls
}

export interface FunctionCall {
  name: string;
  arguments: any;
  tool_call_id?: string;
}

export class LlmNativeFunctionParser<
  T extends BaseParser<any>,
> extends BaseParser<ParserOutput<T> | FunctionCall | FunctionCall[]> {
  public parser: T;
  private multiple: boolean;

  constructor(options: LlmNativeFunctionParserOptions<T>) {
    super("openAiFunction", options, "function_call");
    this.parser = options.parser;
    this.multiple = options.multiple || false;
  }
  
  parse(text: OutputResultContent[], _options?: Record<string, any>) {
    const functionCalls = text?.filter((a) => a.type === "function_use") || [];
    
    if (functionCalls.length > 0) {
      const results = functionCalls.map(func => ({
        name: func.name,
        arguments: maybeParseJSON(func.input),
        tool_call_id: func.tool_call_id
      }));
      
      if (this.multiple) {
        return results;
      }
      return results[0];
    }

    return this.parser.parse(getResultText(text)) as ParserOutput<T>;
  }
}

/**
 * @deprecated Use `LlmExecutorWithFunctions` instead.
 */
export const OpenAiFunctionParser = LlmNativeFunctionParser;