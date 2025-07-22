import { BaseParserOptions, OutputResultContent, ParserOutput } from "@/types";
import { BaseParser } from "../_base";
import { maybeParseJSON } from "@/utils";
import { getResultText } from "@/llm/output/_utils/getResultText";

export interface FunctionCallParserOptions<T extends BaseParser<any>>
  extends BaseParserOptions {
  parser: T;
  multiple?: boolean;  // Support for multiple function calls
}

export interface FunctionCall {
  name: string;
  arguments: any;
  tool_call_id?: string;
}

export class FunctionCallParser<T extends BaseParser<any>> extends BaseParser<
  ParserOutput<T> | FunctionCall | FunctionCall[]
> {
  public parser: T;
  private multiple: boolean;

  constructor(options: FunctionCallParserOptions<T>) {
    super("functionCall", options, "function_call");
    this.parser = options.parser;
    this.multiple = options.multiple || false;
  }

  parse(text: OutputResultContent[], _options?: Record<string, any>) {
    const functionCalls = text?.filter((a) => a.type === "function_use") || [];
    
    if (functionCalls.length > 0) {
      const results = functionCalls.map(func => ({
        name: func.name,
        arguments: maybeParseJSON(func.input),
        tool_call_id: func.tool_call_id  // Preserve ID if present
      }));
      
      // Return array if multiple mode, otherwise first item
      if (this.multiple) {
        return results;
      }
      return results[0];
    }

    // No function calls found, use fallback parser
    return this.parser.parse(getResultText(text)) as ParserOutput<T>;
  }
}

// Deprecated alias for backward compatibility
/**
 * @deprecated Use `FunctionCallParser` instead. Will be removed in next major version.
 */
export class OpenAiFunctionParser<T extends BaseParser<any>> extends FunctionCallParser<T> {
  constructor(options: FunctionCallParserOptions<T>) {
    console.warn("OpenAiFunctionParser is deprecated. Use FunctionCallParser instead.");
    super(options);
    // Override the name for backward compatibility
    (this as any).name = "openAiFunction";
  }
}