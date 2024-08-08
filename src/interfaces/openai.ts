import { CallableExecutorCore } from "./index";

export type OpenAIChatModelName =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0613"
  | "gpt-3.5-turbo-16k"
  | "gpt-4-0613"
  | "gpt-4"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-0613"
  | "gpt-4-32k-0613"
  | `gpt-4${string}`
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

export type OpenAiFunctionCall =
  | "auto"
  | "none"
  | "required"
  | { name: string };

export interface LlmExecutorExecuteOptions {
  functions?: CallableExecutorCore[];
  function_call?: any;
  json_schema?: Record<string, any>
}

export type GenericFunctionCall = "auto" | "none" | "any" | { name: string };
export interface OpenAiLlmExecutorOptions<
  T extends GenericFunctionCall = "auto"
> extends LlmExecutorExecuteOptions {
  functions?: CallableExecutorCore[];
  function_call?: T;
  json_schema?: Record<string, any>
}
