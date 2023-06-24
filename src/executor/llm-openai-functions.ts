import {
  PromptInput,
  ParserOutput,
  CoreExecutorExecuteOptions,
  ExecutorWithLlmOptions,
  ExecutorExecutionMetadata,
  LlmExecutorHooks,
  OpenAiLlmExecutorOptions,
  OpenAiFunctionCall,
} from "@/types";
import { OpenAI } from "@/llm";
import { BasePrompt } from "@/prompt";
import { BaseState } from "@/state";
import { BaseExecutor } from "./_base";
import { OpenAiFunctionParser } from "@/parser/parsers/OpenAiFunctionParser";
import { BaseParser, StringParser } from "@/parser";

/**
 * Core Executor With LLM
 */
export class LlmExecutorOpenAiChat<
  Llm extends OpenAI,
  Prompt extends BasePrompt<Record<string, any>>,
  Parser extends BaseParser,
  State extends BaseState
> extends BaseExecutor<
  PromptInput<Prompt>,
  ParserOutput<
    | OpenAiFunctionParser<Parser>
    | {
        name: string;
        arguments: string;
      }
  >,
  LlmExecutorHooks
> {
  public llm;
  public prompt;
  public promptFn: any;
  public parser;

  constructor(
    llmConfiguration: ExecutorWithLlmOptions<Llm, Prompt, Parser, State>,
    options?: CoreExecutorExecuteOptions<LlmExecutorHooks>
  ) {
    super(
      llmConfiguration.name || "anonymous-llm-executor",
      "llm-executor",
      options
    );

    this.llm = llmConfiguration.llm;

    this.parser = new OpenAiFunctionParser({
      parser: llmConfiguration.parser || new StringParser(),
    });

    if (typeof llmConfiguration.prompt === "function") {
      this.prompt = undefined;
      this.promptFn = llmConfiguration.prompt;
    } else {
      this.prompt = llmConfiguration.prompt;
      this.promptFn = null;
    }
  }

  async execute<T extends Extract<OpenAiFunctionCall, "none">>(
    _input: PromptInput<Prompt>,
    _options: OpenAiLlmExecutorOptions<T>
  ):  Promise<ParserOutput<Parser>>

  async execute<T extends Exclude<OpenAiFunctionCall, "none">>(
    _input: PromptInput<Prompt>,
    _options: OpenAiLlmExecutorOptions<T>
  ):  Promise<ParserOutput<OpenAiFunctionParser<Parser>>>

  async execute<T extends OpenAiFunctionCall>(
    _input: PromptInput<Prompt>,
    _options: OpenAiLlmExecutorOptions<T>
  ):  Promise<ParserOutput<OpenAiFunctionParser<Parser>> | ParserOutput<Parser>>

  async execute<T extends OpenAiFunctionCall = any>(
    _input: PromptInput<Prompt>,
    _options: OpenAiLlmExecutorOptions<T>
  ):  Promise<ParserOutput<OpenAiFunctionParser<Parser>> | ParserOutput<Parser>> {
    if(_options.function_call === "none"){
      return super.execute(_input, _options) as ParserOutput<Parser>
    }else{
      return super.execute(_input, _options) as ParserOutput<OpenAiFunctionParser<Parser>>
    }
  }
  async handler(_input: PromptInput<Prompt>, ..._args: any[]) {
    const call = await this.llm.call(_input, ..._args);
    const result = call.getResultContent();
    return result;
  }

  getHandlerInput(_input: PromptInput<Prompt>): any {
    if (this.prompt) {
      return this.prompt.format(_input);
    }

    if (this.promptFn) {
      const prompt = this.promptFn(_input);
      const promptFormatted = prompt.format(_input);
      return promptFormatted;
    }
    throw new Error("Missing prompt");
  }

  getHandlerOutput(
    out: any,
    _metadata: ExecutorExecutionMetadata<
      PromptInput<Prompt>,
      ParserOutput<Parser>
    >,
    _options?: any
  ): ParserOutput<Parser> {
    return this.parser.parse(out) as ParserOutput<Parser>;
  }

  metadata() {
    return {
      llm: this.llm.getMetadata(),
    };
  }
}
