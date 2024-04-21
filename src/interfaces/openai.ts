import { CallableExecutorCore } from "./index";
import { PromptType } from "./prompt";

export interface BaseLlmOptions {
  traceId?: null | string;
  timeout?: number;
  maxDelay?: number;
  numOfAttempts?: number;
  jitter?: "none" | "full";
  promptType?: PromptType;
}

export type OpenAIChatModelName =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0613"
  | "gpt-3.5-turbo-16k"
  | "gpt-4-0613"
  | "gpt-4"
  | "gpt-4-0613"
  | "gpt-4-32k-0613"
  | `gpt-4-${string}`
  | `gpt-3.5-turbo-${string}`;

export type OpenAIConversationModelName =
  | "davinci"
  | "text-curie-001"
  | "text-babbage-001"
  | "text-ada-001";

export type OpenAIEmbeddingModelName = "text-embedding-ada-002";

export type OpenAIModelName =
  | OpenAIChatModelName
  | OpenAIConversationModelName
  | OpenAIEmbeddingModelName;

export interface OpenAIOptions extends BaseLlmOptions {
  openAIApiKey?: string;
  modelName: OpenAIModelName;
  maxTokens?: number;
  temperature?: number;
  topP?: number | null;
  n?: number | null;
  stream?: boolean | null;
  stop?: any;
  max_tokens?: number;
  presencePenalty?: number | null;
  frequencyPenalty?: number | null;
  logitBias?: object | null;
  user?: string;
  function_call?: OpenAiFunctionCall;
  functions?: CallableExecutorCore[];
  useJson?: boolean;
}

export interface EmbedOpenAIOptions extends OpenAIOptions {
  openAIApiKey: string;
  modelName: OpenAIModelName;
  batchSize?: number;
  stripNewLines?: boolean;
}

export type OpenAiFunctionCall = "auto" | "none" | { name: string; };

export interface LlmExecutorExecuteOptions {}

export interface OpenAiLlmExecutorOptions<T extends OpenAiFunctionCall = "auto"> extends LlmExecutorExecuteOptions {
  functions: CallableExecutorCore[];
  function_call: T;
}
