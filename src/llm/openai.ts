import { OpenAiRequest } from "@/types";
import { createLlmV3 } from "./llmV2";

/**
 * Create a new instance of the OpenAI API wrapper.
 * @param options - Configuration options for the OpenAI API wrapper.
 * @returns - A new instance of the OpenAI API wrapper class.
 */
export function createLlmOpenAi(options: OpenAiRequest, _client?: any) {
  return createLlmV3("openai", options);
}

/**
 * A class that extends BaseLlm and provides functionality for the OpenAI API.
 */
// export class LlmOpenAI extends BaseLlm<OpenAI> {
//   private model: OpenAIModelName;
//   private temperature: number;
//   private maxTokens: number;
//   private topP: number | null;
//   private n: number | null = null;
//   private stream: boolean | null;
//   private stop: any = null;
//   private presencePenalty: number | null;
//   private frequencyPenalty: number | null;
//   private logitBias: object | null;
//   private user: string;
//   private useJson: boolean;

//   /**
//    * Constructor for the OpenAI class.
//    * @param {OpenAIOptions} options - Configuration options for the OpenAI API wrapper.
//    */
//   constructor(options: OpenAIOptions, client: OpenAI) {
//     const {
//       openAIApiKey = getEnvironmentVariable("OPEN_AI_API_KEY"),
//       modelName,
//       temperature,
//       maxTokens,
//       topP = null,
//       n = null,
//       stream = null,
//       stop,
//       presencePenalty = null,
//       frequencyPenalty = null,
//       logitBias = null,
//       user = "",
//       useJson,
//       ...restOfOptions
//     } = options;

//     super(restOfOptions, client);

//     this.model = modelName || "gpt-3.5-turbo";
//     this.temperature = temperature || 0;
//     this.maxTokens = maxTokens || 500;
//     this.topP = topP;
//     this.n = n;
//     this.stream = stream;
//     this.stop = stop;
//     this.presencePenalty = presencePenalty;
//     this.frequencyPenalty = frequencyPenalty;
//     this.logitBias = logitBias;
//     this.user = user;
//     this.useJson = !!useJson;

//     if (
//       this.model.substring(0, 13) === "gpt-3.5-turbo" ||
//       this.model.substring(0, 5) === "gpt-4"
//     ) {
//       this.promptType = "chat";
//     } else {
//       this.promptType = "text";
//     }
//   }

//   /**
//    * Get the total prompt and completion tokens across all calls to the API.
//    * @returns - An object with total prompt and completion tokens.
//    */
//   getMetrics() {
//     let total_completionTokens = 0;
//     let total_promptTokens = 0;
//     let total_totalTokens = 0;

//     for (const item of this.metrics.history) {
//       /* istanbul ignore next */
//       const {
//         completion_tokens = 0,
//         prompt_tokens = 0,
//         total_tokens = 0,
//       } = item.usage;
//       total_completionTokens = total_completionTokens + completion_tokens;
//       total_promptTokens = total_promptTokens + prompt_tokens;
//       total_totalTokens = total_totalTokens + total_tokens;
//     }
//     return {
//       total_completionTokens,
//       total_promptTokens,
//       total_totalTokens,
//     };
//   }
//   /**
//    * Calculate the API call cost based on input and output tokens.
//    * @param input_tokens - The number of input tokens.
//    * @param output_tokens=0 - The number of output tokens (defaults to 0).
//    * @returns An object for input/output tokens and cost.
//    */
//   calculatePrice(input_tokens: number, output_tokens: number = 0) {
//     return calculateOpenAiPrice(this.model, input_tokens, output_tokens);
//   }

//   /**
//    * Log a table containing usage metrics for the OpenAI API.
//    */
//   logMetrics() {
//     const metrics = this.getMetrics();
//     /* istanbul ignore next */
//     const {
//       total_completionTokens = 0,
//       total_promptTokens = 0,
//       total_totalTokens = 0,
//     } = metrics;

//     const cost = this.calculatePrice(
//       total_promptTokens,
//       total_completionTokens
//     );

//     console.table([
//       {
//         ["Total Calls"]: this.metrics.total_call_success,
//         ["Total Completion Tokens"]: total_completionTokens,
//         ["Total Completion Cost"]: parseFloat(cost.output_cost.toFixed(3)),
//         ["Total Prompt Tokens"]: total_promptTokens,
//         ["Total Prompt Cost"]: parseFloat(cost.input_cost.toFixed(3)),
//         ["Total Tokens"]: total_totalTokens,
//         ["Total Cost"]: parseFloat(cost.total_cost.toFixed(3)),
//       },
//     ]);
//   }

//   /**
//    * Wrapper function to call chat/completion with the specified input.
//    * @private
//    * @param input - The input for the chat/completion API.
//    * @returns The chat/completion response from the API.
//    */
//   async _call(input: string | IChatMessages, arg2?: OpenAiLlmExecutorOptions) {
//     if (
//       this.model.substring(0, 13) === "gpt-3.5-turbo" ||
//       this.model.substring(0, 5) === "gpt-4"
//     ) {
//       assert(Array.isArray(input), "Invalid prompt.");
//       return await this.chat(input, arg2);
//     } else {
//       assert(typeof input === "string");
//       return await this.completion(input);
//     }
//   }

//   /**
//    * Communicate with the OpenAI Chat API.
//    * @param messages - A list of message objects for the API call.
//    * @returns The chat response from the API.
//    */
//   async chat(messages: IChatMessages, _args?: OpenAiLlmExecutorOptions) {
//     assert(Array.isArray(messages), "Invalid prompt.");
//     const options: Partial<
//       OpenAIOptions & { response_format: { type: "json_object" } }
//     > = removeEmptyFromObject({
//       messages,
//       model: this.model,
//       temperature: this.temperature,
//       max_tokens: this.maxTokens,
//       topP: this.topP,
//       n: this.n,
//       stream: this.stream,
//       stop: this.stop,
//       presencePenalty: this.presencePenalty,
//       frequencyPenalty: this.frequencyPenalty,
//       logitBias: this.logitBias,
//       user: this.user,
//     });

//     if (_args && _args?.function_call) {
//       options["function_call"] = _args?.function_call;
//     }

//     if (_args && _args?.functions?.length) {
//       options["functions"] = _args.functions.map((f) =>
//         pick(f, ["name", "description", "parameters"])
//       );
//     }

//     if (this.useJson) {
//       options.response_format = { type: "json_object" };
//     }

//     const response = await this.client.chat.completions.create(options as any);
//     this.metrics.history.push(response);
//     return new OutputOpenAIChat(response);
//   }

//   /**
//    * Communicate with the OpenAI Completion API.
//    * @param messages - A list of message objects for the API call.
//    * @returns The chat response from the API.
//    */
//   async completion(prompt: string) {
//     assert(typeof prompt === "string" && prompt !== "", "Missing prompt.");
//     const options = removeEmptyFromObject({
//       prompt,
//       model: this.model,
//       temperature: this.temperature,
//       max_tokens: this.maxTokens,
//       topP: this.topP,
//       n: this.n,
//       stream: this.stream,
//       stop: this.stop,
//       presencePenalty: this.presencePenalty,
//       frequencyPenalty: this.frequencyPenalty,
//       logitBias: this.logitBias,
//       user: this.user,
//     });

//     const response = await this.client.completions.create(options);

//     this.metrics.history.push(response);
//     return new OutputOpenAICompletion(response);
//   }

//   getMetadata() {
//     return Object.assign(
//       {},
//       super.getMetadata(),
//       removeEmptyFromObject({
//         model: this.model,
//         temperature: this.temperature,
//         max_tokens: this.maxTokens,
//         topP: this.topP,
//         n: this.n,
//         stream: this.stream,
//         stop: this.stop,
//         presencePenalty: this.presencePenalty,
//         frequencyPenalty: this.frequencyPenalty,
//         logitBias: this.logitBias,
//         user: this.user,
//       })
//     );
//   }

//   // shouldRetry(_error: any, _stepNumber: number) {
//   //   if(["context_length_exceeded"].includes(_error?.response?.data?.error?.code)){
//   //     return false;
//   //   }
//   //   return true;
//   // }

//   // handleError(_error: any) {
//   //   const errorMessage = _error?.response?.data?.error?.message;
//   //   const errorCode = _error?.response?.data?.error?.code;
//   //   throw new Error(`[${errorCode}] ${errorMessage}`)
//   // }
// }
