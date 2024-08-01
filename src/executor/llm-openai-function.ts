import {
  BaseLlm,
  PromptInput,
  ParserOutput,
  CoreExecutorExecuteOptions,
  ExecutorWithLlmOptions,
  LlmExecutorHooks,
  OpenAiLlmExecutorOptions,
  GenericFunctionCall,
} from "@/types";
import { BasePrompt } from "@/prompt";
import { BaseState } from "@/state";
import { OpenAiFunctionParser } from "@/parser/parsers/OpenAiFunctionParser";
import { BaseParser, StringParser } from "@/parser";
import { LlmExecutor } from "./llm";

/**
 * Core Executor With LLM
 */
export class LlmExecutorOpenAiFunctions<
  Llm extends BaseLlm,
  Prompt extends BasePrompt<Record<string, any>>,
  Parser extends BaseParser,
  State extends BaseState
> extends LlmExecutor<Llm, Prompt, Parser, State> {
  constructor(
    llmConfiguration: ExecutorWithLlmOptions<Llm, Prompt, Parser, State>,
    options?: CoreExecutorExecuteOptions<LlmExecutorHooks>
  ) {
    super(
      Object.assign({}, llmConfiguration, {
        parser: new OpenAiFunctionParser({
          parser: llmConfiguration.parser || new StringParser(),
        }),
      }),
      options
    );
  }
async execute<T extends GenericFunctionCall>(
  _input: PromptInput<Prompt>,
  _options: OpenAiLlmExecutorOptions<T>
): Promise<ParserOutput<Parser>>
  async execute<T extends GenericFunctionCall>(
    _input: PromptInput<Prompt>,
    _options: OpenAiLlmExecutorOptions<T>
  ) {
    return super.execute(_input, _options) 
  }
}