import {
  BaseLlm,
  PromptInput,
  ParserOutput,
  CoreExecutorExecuteOptions,
  ExecutorWithLlmOptions,
  ExecutorExecutionMetadata,
  LlmExecutorHooks,
  LlmExecutorExecuteOptions,
} from "@/types";
import { BaseParser, StringParser } from "@/parser";
import { BasePrompt } from "@/prompt";
import { BaseState } from "@/state";
import { BaseExecutor } from "./_base";

/**
 * Core Executor With LLM
 */
export class LlmExecutor<
  Llm extends BaseLlm<any>,
  Prompt extends BasePrompt<Record<string, any>>,
  Parser extends BaseParser,
  State extends BaseState
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
    return super.execute(_input, _options);
  }

  async handler(_input: PromptInput<Prompt>, ..._args: any[]) {
    const call = await this.llm.call(_input, ..._args);
    const result = call.getResultText()
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
    >
  ): ParserOutput<Parser> {
    return this.parser.parse(out, _metadata);
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
