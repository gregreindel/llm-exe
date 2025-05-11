import {
  BaseLlm,
  PromptInput,
  ParserOutput,
  CoreExecutorExecuteOptions,
  ExecutorWithLlmOptions,
  ExecutorExecutionMetadata,
  LlmExecutorHooks,
  LlmExecutorExecuteOptions,
  BaseLlCall,
} from "@/types";
import { BaseParser, JsonParser, StringParser } from "@/parser";
import { BasePrompt } from "@/prompt";
import { BaseState } from "@/state";
import { BaseExecutor } from "./_base";
import { isPromise } from "@/utils/modules/isPromise";

/**
 * Core Executor With LLM
 */
export class LlmExecutor<
  Llm extends BaseLlm<any>,
  Prompt extends BasePrompt<Record<string, any>>,
  Parser extends BaseParser,
  State extends BaseState,
> extends BaseExecutor<
  PromptInput<Prompt>,
  ParserOutput<Parser>,
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
    this.parser = llmConfiguration?.parser || new StringParser();

    if (typeof llmConfiguration.prompt === "function") {
      this.prompt = undefined;
      this.promptFn = llmConfiguration.prompt;
    } else {
      this.prompt = llmConfiguration.prompt;
      this.promptFn = null;
    }
  }

  async execute(
    _input: PromptInput<Prompt>,
    _options?: LlmExecutorExecuteOptions
  ): Promise<ParserOutput<Parser>> {
    const input = _input ?? {};
    if (this?.parser instanceof JsonParser && this.parser.schema) {
      _options = Object.assign(_options || {}, {
        jsonSchema: this.parser.schema,
      });
    }
    return super.execute(input, _options);
  }

  async handler(_input: PromptInput<Prompt>, ..._args: any[]) {
    const call = await this.llm.call(_input, ..._args);
    return call;
  }

  async getHandlerInput(_input: PromptInput<Prompt>): Promise<any> {
    if (this.prompt) {
      if (isPromise(this.prompt.formatAsync)) {
        return await this.prompt.formatAsync(_input);
      } else {
        return this.prompt.format(_input);
      }
    }

    if (this.promptFn) {
      const prompt = this.promptFn(_input);
      if (isPromise(prompt.formatAsync)) {
        return await prompt.formatAsync(_input);
      } else {
        return prompt.format(_input);
      }
    }
    throw new Error("Missing prompt");
  }

  getHandlerOutput(
    out: BaseLlCall,
    _metadata: ExecutorExecutionMetadata<
      PromptInput<Prompt>,
      ParserOutput<Parser>
    >
  ): ParserOutput<Parser> {
    // depending on out parser type, and result obj (out)
    // we should use different methods here
    if (this.parser.target === "function_call") {
      const outToStr = out.getResultContent();
      return this.parser.parse(outToStr, _metadata);
    } else {
      const outToStr = out.getResultText();
      return this.parser.parse(outToStr, _metadata);
    }
  }

  metadata() {
    return {
      llm: this.llm.getMetadata(),
    };
  }
  getTraceId() {
    if (this.traceId) {
      return this.traceId;
    }
    return this.llm.getTraceId();
  }
}
