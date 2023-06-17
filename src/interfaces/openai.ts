import { PromptType } from "./prompt";

export interface BaseLlmOptions {
  timeout?: number;
  maxDelay?: number;
  numOfAttempts?: number;
  jitter?: "none" | "full";
  promptType?: PromptType;
}

export type OpenAIChatModelName = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4";

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
  openAIApiKey: string;
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
}

export interface EmbedOpenAIOptions extends OpenAIOptions {
  openAIApiKey: string;
  modelName: OpenAIModelName;
  batchSize?: number;
  stripNewLines?: boolean;
}
