import { IChatMessageRole } from "./chat";
import { PromptType } from "./prompt";

interface OutputOpenAIChatChoiceBase {
  message: {
    role: Extract<IChatMessageRole, "assistant">;
    content: string | null;
    tool_calls:
      | null
      | {
          type: "function";
          function: {
            name: string;
            arguments: string;
          };
        }[];
  };
  finish_reason: "tool_calls" | "stop";
}

export interface OutputOpenAIChatChoiceFunction
  extends OutputOpenAIChatChoiceBase {
  message: {
    role: Extract<IChatMessageRole, "assistant">;
    content: null;
    tool_calls: {
      type: "function";
      function: {
        name: string;
        arguments: string;
      };
    }[];
  };
  finish_reason: Extract<"tool_calls" | "stop", "tool_calls">;
}

export interface OutputOpenAIChatChoiceMessage
  extends OutputOpenAIChatChoiceBase {
  message: {
    role: Extract<IChatMessageRole, "assistant">;
    content: string;
    tool_calls: null;
  };
  finish_reason: Exclude<"tool_calls" | "stop", "tool_calls">;
}

export type OutputOpenAIChatChoice =
  | OutputOpenAIChatChoiceFunction
  | OutputOpenAIChatChoiceMessage;

export interface OpenAiResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: OutputOpenAIChatChoice[];
}

/**
 * Claude
 */
export interface Claude2Request {
  prompt: string;
  temperature: number;
  top_p: number;
  top_k: number;
  max_tokens_to_sample: number;
  stop_sequences: string[];
  metadata: Record<string, any>;
  stream: boolean;
}

export interface Claude2Response {
  completion: string;
  id: string;
  model: string;
  stop_reason: "stop_sequence";
  type: "completion";
}

export interface Claude3Response {
  id: string;
  type: string;
  role: "assistant";
  content: (
    | {
        id: string;
        type: "text";
        text: string;
      }
    | {
        type: "tool_use";
        id: string;
        name: string;
        input: Record<string, any>;
      }
  )[];
  model: string;
  stop_reason: "end_turn" | "tool_use";
  stop_sequence: null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * x.ai Grok
 */
export interface XAiResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  usage: {
    prompt_tokens: 28;
    completion_tokens: 5;
    total_tokens: 33;
    prompt_tokens_details: {
      text_tokens: 28;
      audio_tokens: 0;
      image_tokens: 0;
      cached_tokens: 0;
    };
  };
  choices: OutputOpenAIChatChoice[];
}

/**
 * Llama
 */
export interface MetaLlama2Request {
  prompt: string;
  temperature: number;
  top_p: number;
  max_gen_len: number;
}

export interface MetaLlama2Response {
  generation: string;
  prompt_token_count: number;
  generation_token_count: number;
  stop_reason: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message?: {
    role?: string;
    content?: string;
  };
  done?: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Amazon Titan
 */

export interface AmazonTitalRequest {
  inputText: string;
  textGenerationConfig: {
    temperature: number;
    topP: number;
    maxTokenCount: number;
    stopSequences: string[];
  };
}

export interface AmazonTitalResponse {
  inputTextTokenCount: number;
  results: [
    {
      tokenCount: number;
      outputText: string;
      completionReason: string;
    }
  ];
}

/**
 * Gemini
 */
interface OutputGoogleGeminiChatChoiceBase {
  content: {
    role?: Extract<IChatMessageRole, "model">;
    parts: {
      text?: string
      functionCall?:
      | null
      | {
        name: string;
        args: string;
      }
    }[]

  };
  finishReason: "STOP";
  avgLogprobs?: number;
}

export interface OutputGoogleGeminiChatChoiceFunction
  extends OutputGoogleGeminiChatChoiceBase {
  content: {
    role?: Extract<IChatMessageRole, "model">;
    parts: {
      text: undefined
      functionCall?: {
        name: string;
        args: string;
      }
    }[]
  };
  finishReason: "STOP";
  avgLogprobs?: number;
}

export interface OutputGoogleGeminiChatChoiceMessage
  extends OutputGoogleGeminiChatChoiceBase {
  content: {
    role?: Extract<IChatMessageRole, "model">;
    parts: {
      text: string;
      functionCall?: null;
    }[]
  };
  finishReason: "STOP";
  avgLogprobs?: number;
}

export type OutputGoogleGeminiChatChoice =
  | OutputGoogleGeminiChatChoiceFunction
  | OutputGoogleGeminiChatChoiceMessage;

export interface GoogleGeminiResponse {
  modelVersion: string;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    promptTokensDetails: [
      {
        modality: "TEXT";
        tokenCount: number;
      }
    ];
    candidatesTokensDetails: [
      {
        modality: "TEXT";
        tokenCount: number;
      }
    ];
  };
  candidates: OutputGoogleGeminiChatChoice[];
}



export interface OutputResultsBase {
  type: "text" | "function_use";
  text?: string;
}

export interface OutputResultsText extends OutputResultsBase {
  type: "text";
  text: string;
}

export interface OutputResultsFunction extends OutputResultsBase {
  type: "function_use";
  name: string;
  input: Record<string, any>;
}

export type OutputResultContent = OutputResultsText | OutputResultsFunction;

export interface OutputResult {
  id: string;
  name?: string;
  created: number;
  stopReason: string;
  content: OutputResultContent[];
  options?: OutputResultContent[][];
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingOutputResult {
  id: string;
  model?: string;
  created: number;
  embedding: number[][];
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export interface BaseLlmOptions {
  traceId?: null | string;
  timeout?: number;
  maxDelay?: number;
  numOfAttempts?: number;
  jitter?: "none" | "full";
  promptType?: PromptType;
}

export interface GenericEmbeddingOptions extends BaseLlmOptions {
  model?: string;
  // input: string;
  dimensions?: number;
}

export interface OpenAiEmbeddingOptions extends GenericEmbeddingOptions {
  model?: string;
  openAiApiKey?: string;
}

export interface AmazonEmbeddingOptions extends GenericEmbeddingOptions {
  model: string;
  awsRegion?: string;
  awsSecretKey?: string;
  awsAccessKey?: string;
}

// theirs
export interface OpenAiEmbeddingApiRequestInput {
  input: string;
  model: string;
  encoding_format?: string;
  dimensions?: number;
  user?: string;
}

// theirs
export interface OpenAiEmbeddingApiResponseOutput {
  object: string;
  data: {
    object: string;
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface AmazonTitanEmbeddingApiResponseOutput {
  embedding: number[];
  inputTextTokenCount: number;
}

export interface GenericLLm extends BaseLlmOptions {
  model?: string;
  system?: string;
  prompt?: string | { role: string; content: string }[];
  temperature?: number;
  topP?: number;
  stream?: boolean;
  streamOptions?: Record<string, any>;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface OpenAiRequest extends GenericLLm {
  model: string;
  frequencyPenalty?: number;
  logitBias?: Record<string, any> | null;
  responseFormat?: Record<string, any>;
  openAiApiKey?: string;
  useJson?: boolean;
}

export interface AmazonBedrockRequest extends GenericLLm {
  model: string;
  awsRegion?: string;
  awsSecretKey?: string;
  awsAccessKey?: string;
}

export interface AnthropicRequest extends GenericLLm {
  model: string;
  anthropicApiKey?: string;
}

export interface GeminiRequest extends GenericLLm {
  model: string;
  geminiApiKey?: string;
}

export interface DeepseekRequest extends GenericLLm {
  model: string;
  responseFormat?: Record<string, any>;
  deepseekApiKey?: string;
  useJson?: boolean;
}

export type AllEmbedding = {
  "openai.embedding.v1": {
    input: OpenAiEmbeddingOptions;
    // output: OpenAiRequest;
  };
  "amazon.embedding.v1": {
    input: AmazonEmbeddingOptions;
  };
};

export type AllLlm = {
  "openai.chat.v1": {
    input: OpenAiRequest;
    // output: OpenAiRequest;
  };
  "openai.chat-mock.v1": {
    input: OpenAiRequest;
    // output: OpenAiRequest;
  };
  "anthropic.chat.v1": {
    input: AnthropicRequest;
    // output: Claude3Response;
  };
  "amazon:anthropic.chat.v1": {
    input: AnthropicRequest & AmazonBedrockRequest;
    // output: OpenAiRequest;
  };
  "amazon:meta.chat.v1": {
    input: AmazonBedrockRequest;
    // output: OpenAiRequest;
  };
  // "amazon:nova.chat.v1": {
  //   input: AmazonBedrockRequest;
  //   // output: OpenAiRequest;
  // };
  "xai.chat.v1": {
    input: GenericLLm;
    // output: OpenAiRequest;
  };
  "ollama.chat.v1": {
    input: GenericLLm;
    // output: OpenAiRequest;
  };
  "google.chat.v1": {
    input: GeminiRequest;
    // output: OpenAiRequest;
  };
  "deepseek.chat.v1": {
    input: DeepseekRequest;  
    // output: OpenAiRequest;
  };
};

export type AllUseLlmOptions = AllLlm & {
  "openai.gpt-4": {
    input: OpenAiRequest;
  };
  "openai.gpt-4o": {
    input: Omit<OpenAiRequest, "model">;
  };
  "openai.gpt-4o-mini": {
    input: Omit<OpenAiRequest, "model">;
  };
  "anthropic.claude-3-7-sonnet": {
    input: Omit<AnthropicRequest, "model">;
  };
  "anthropic.claude-3-5-sonnet": {
    input: Omit<AnthropicRequest, "model">;
  };
  "anthropic.claude-3-opus": {
    input: Omit<AnthropicRequest, "model">;
  };
  "anthropic.claude-3-sonnet": {
    input: Omit<AnthropicRequest, "model">;
  };
  "anthropic.claude-3-5-haiku": {
    input: Omit<AnthropicRequest, "model">;
  };
  "google.gemini-2.5-pro-exp-03-25": {
    input: Omit<GeminiRequest, "model">;
    // output: OpenAiRequest;
  };
  "google.gemini-2.0-flash": {
    input: Omit<GeminiRequest, "model">;
    // output: OpenAiRequest;
  };
  "google.gemini-2.0-flash-lite": {
    input: Omit<GeminiRequest, "model">;
    // output: OpenAiRequest;
  };
  "google.gemini-1.5-pro": {
    input: Omit<GeminiRequest, "model">;
    // output: OpenAiRequest;
  };
  "xai.grok-2": {
    input: OpenAiRequest;
  };
  "ollama.deepseek-r1": {
    input: GenericLLm;
  };
  "ollama.llama3.3": {
    input: GenericLLm;
  };
  "ollama.llama3.2": {
    input: GenericLLm;
  };
  "ollama.llama3.1": {
    input: GenericLLm;
  };
  "ollama.qwq": {
    input: GenericLLm;
  };
  "deepseek.chat": {
    input: DeepseekRequest;
  }
};

export type LlmProviderKey = keyof AllLlm;
export type EmbeddingProviderKey = keyof AllEmbedding;
export type UseLlmKey = keyof AllUseLlmOptions;

export interface BaseLlCall {
  getResultContent: () => OutputResultContent[];
  getResultText: () => string;
  getResult: () => OutputResult;
}

export interface BaseEmbeddingCall {
  getEmbedding: () => number[];
  getResult: () => EmbeddingOutputResult;
}

export interface BaseRequest<_T extends Record<string, any>> {
  call: (...args: any[]) => Promise<_T>;
  getTraceId: () => string | null;
  withTraceId: (traceId: string) => void;
  getMetadata: () => Record<string, any>;
}

export interface BaseLlm<_T extends BaseLlCall = BaseLlCall>
  extends BaseRequest<_T> {}
export interface BaseEmbedding<_T extends BaseEmbeddingCall = BaseEmbeddingCall>
  extends BaseRequest<_T> {}

export interface CombinedJsonLResult<T extends Record<string, any> = any> {
  result: T; // All "message.content" values concatenated;
  content: OutputResultContent; // The object containing the response metadata
  lines: T[]; // Full JSON objects from each line
}
