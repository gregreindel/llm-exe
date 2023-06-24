import { Configuration, OpenAIApi } from "openai";
import {
  IChatMessages,
  OpenAIModelName,
  OpenAIOptions,
  OpenAiLlmExecutorOptions,
} from "@/types";
import { BaseLlm } from "./_base";
import { OutputOpenAIChat } from "@/llm/output";
import { assert, pick, removeEmptyFromObject } from "@/utils";
import { OutputOpenAICompletion } from "./output/openai";
import { OpenAiPricing } from "@/utils/const";

/**
 * Create a new instance of the OpenAI API wrapper.
 * @param options - Configuration options for the OpenAI API wrapper.
 * @returns - A new instance of the OpenAI API wrapper class.
 */
export function createLlmOpenAi(options: OpenAIOptions) {
  return new OpenAI(options);
}

/**
 * A class that extends BaseLlm and provides functionality for the OpenAI API.
 */
export class OpenAI extends BaseLlm<OpenAIApi> {
  private model: OpenAIModelName;
  private temperature: number;
  private maxTokens: number;
  private topP: number | null;
  private n: number | null = null;
  private stream: boolean | null;
  private stop: any = null;
  private presencePenalty: number | null;
  private frequencyPenalty: number | null;
  private logitBias: object | null;
  private user: string;

  /**
   * Constructor for the OpenAI class.
   * @param {OpenAIOptions} options - Configuration options for the OpenAI API wrapper.
   */
  constructor(options: OpenAIOptions) {
    const {
      openAIApiKey,
      modelName,
      temperature,
      maxTokens,
      topP = null,
      n = null,
      stream = null,
      stop,
      presencePenalty = null,
      frequencyPenalty = null,
      logitBias = null,
      user = "",
      ...restOfOptions
    } = options;

    super(restOfOptions);

    this.model = modelName || "gpt-3.5-turbo";
    this.temperature = temperature || 0;
    this.maxTokens = maxTokens || 500;
    this.topP = topP;
    this.n = n;
    this.stream = stream;
    this.stop = stop;
    this.presencePenalty = presencePenalty;
    this.frequencyPenalty = frequencyPenalty;
    this.logitBias = logitBias;
    this.user = user;

    

    if (this.model.substring(0, 13) === "gpt-3.5-turbo" || 
    this.model.substring(0, 5) === "gpt-4") {
      this.promptType = "chat";
    } else {
      this.promptType = "text";
    }

    this.client = new OpenAIApi(
      new Configuration({
        apiKey: openAIApiKey,
      })
    );
  }

  /**
   * Get the total prompt and completion tokens across all calls to the API.
   * @returns - An object with total prompt and completion tokens.
   */
  getMetrics() {
    let total_completionTokens = 0;
    let total_promptTokens = 0;
    let total_totalTokens = 0;

    for (const item of this.metrics.history) {
      /* istanbul ignore next */
      const {
        completion_tokens = 0,
        prompt_tokens = 0,
        total_tokens = 0,
      } = item.usage;
      total_completionTokens = total_completionTokens + completion_tokens;
      total_promptTokens = total_promptTokens + prompt_tokens;
      total_totalTokens = total_totalTokens + total_tokens;
    }
    return {
      total_completionTokens,
      total_promptTokens,
      total_totalTokens,
    };
  }
  /**
   * Calculate the API call cost based on input and output tokens.
   * @param input_tokens - The number of input tokens.
   * @param output_tokens=0 - The number of output tokens (defaults to 0).
   * @returns An object for input/output tokens and cost.
   */
  calculatePrice(input_tokens: number, output_tokens: number = 0) {
    const out = {
      input_cost: 0,
      output_cost: 0,
      total_cost: 0,
    };

    const price = OpenAiPricing[this.model];
    if (price) {
      const [amount, inputAmount, outputAmount] = price;
      if (inputAmount && input_tokens) {
        out["input_cost"] = (input_tokens / amount) * inputAmount;
      }
      if (outputAmount && output_tokens) {
        out["output_cost"] = (output_tokens / amount) * outputAmount;
      }

      out["total_cost"] = out["input_cost"] + out["output_cost"];
    }

    return out;
  }

  /**
   * Log a table containing usage metrics for the OpenAI API.
   */
  logMetrics() {
    const metrics = this.getMetrics();
    /* istanbul ignore next */
    const {
      total_completionTokens = 0,
      total_promptTokens = 0,
      total_totalTokens = 0,
    } = metrics;

    const cost = this.calculatePrice(
      total_promptTokens,
      total_completionTokens
    );

    console.table([
      {
        ["Total Calls"]: this.metrics.total_call_success,
        ["Total Completion Tokens"]: total_completionTokens,
        ["Total Completion Cost"]: cost.output_cost,
        ["Total Prompt Tokens"]: total_promptTokens,
        ["Total Prompt Cost"]: cost.input_cost,
        ["Total Tokens"]: total_totalTokens,
        ["Total Cost"]: cost.total_cost,
      },
    ]);
  }

  /**
   * Wrapper function to call chat/completion with the specified input.
   * @private
   * @param input - The input for the chat/completion API.
   * @returns The chat/completion response from the API.
   */
  async _call(input: string | IChatMessages, arg2?: OpenAiLlmExecutorOptions) {
    if (this.model.substring(0, 13) === "gpt-3.5-turbo" || 
    this.model.substring(0, 5) === "gpt-4") {
      assert(Array.isArray(input), "Invalid prompt.");
      return await this.chat(input, arg2);
    } else {
      assert(typeof input === "string");
      return await this.completion(input);
    }
  }

  /**
   * Communicate with the OpenAI Chat API.
   * @param messages - A list of message objects for the API call.
   * @returns The chat response from the API.
   */
  async chat(messages: IChatMessages, _args?: OpenAiLlmExecutorOptions) {
    assert(Array.isArray(messages), "Invalid prompt.");
    const options: Partial<OpenAIOptions> = removeEmptyFromObject({
      messages,
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      topP: this.topP,
      n: this.n,
      stream: this.stream,
      stop: this.stop,
      presencePenalty: this.presencePenalty,
      frequencyPenalty: this.frequencyPenalty,
      logitBias: this.logitBias,
      user: this.user,
    });

    if(_args && _args?.function_call ){
      options["function_call"] = _args?.function_call || "none"
    }

    if(_args &&  _args?.functions?.length){
      options["functions"] = _args.functions.map(f => pick(f, ["name", "description", "parameters"]))
    }
    const response = await this.client.createChatCompletion(options as any);
    const { data } = response;
    this.metrics.history.push(data);
    return new OutputOpenAIChat(data);
  }

  /**
   * Communicate with the OpenAI Completion API.
   * @param messages - A list of message objects for the API call.
   * @returns The chat response from the API.
   */
  async completion(prompt: string) {
    assert(typeof prompt === "string" && prompt !== "", "Missing prompt.");
    const options = removeEmptyFromObject({
      prompt,
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      topP: this.topP,
      n: this.n,
      stream: this.stream,
      stop: this.stop,
      presencePenalty: this.presencePenalty,
      frequencyPenalty: this.frequencyPenalty,
      logitBias: this.logitBias,
      user: this.user,
    });

    const response = await this.client.createCompletion(options);

    const { data } = response;
    this.metrics.history.push(data);
    return new OutputOpenAICompletion(data);
  }

  getMetadata() {
    return Object.assign(
      {},
      super.getMetadata(),
      removeEmptyFromObject({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        topP: this.topP,
        n: this.n,
        stream: this.stream,
        stop: this.stop,
        presencePenalty: this.presencePenalty,
        frequencyPenalty: this.frequencyPenalty,
        logitBias: this.logitBias,
        user: this.user,
      })
    );
  }
}
