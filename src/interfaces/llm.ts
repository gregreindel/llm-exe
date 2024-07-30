import { IChatMessageRole } from "./chat";

/**
 * OpenAi
 */
export interface OpenAiRequest {
  messages: any[];
  model: string;
  frequency_penalty: number | null;
  logit_bias: Record<string, any> | null;
  logprobs: number | null;
  top_logprobs: number | null;
  max_tokens: number | null;
  n: number | null;
  presence_penalty: number | null;
  response_format: Record<string, any>;
  seed: number | null;
  service_tier: string | null;
  stop: string | string[] | null;
  stream: boolean | null;
  stream_options: Record<string, any>;
  temperature: number;
  top_p: number;
  tools: any[];
  tool_choice: any[];
  parallel_tool_calls: boolean;
}

interface OutputOpenAIChatChoiceBase {
  message: {
    role: Extract<IChatMessageRole, "assistant">;
    content: string | null;
    tool_calls: null | {
      name: string;
      arguments: string;
    };
  };
  finish_reason: "tool_calls" | "stop";
}

export interface OutputOpenAIChatChoiceFunction
  extends OutputOpenAIChatChoiceBase {
  message: {
    role: Extract<IChatMessageRole, "assistant">;
    content: null;
    tool_calls: {
      name: string;
      arguments: string;
    };
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
  choices: [
    {
      message: {
        role: "assistant";
        content: string;
      };
      logprobs: number | null;
      finish_reason: "stop";
      index: number;
    }
  ];
}

/**
 * Claudef
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
  type: "message";
  role: "assistant";
  content: {
    type: "text";
    text: string;
  }[];
  model: string;
  stop_reason: "end_turn";
  stop_sequence: null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
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


