import { GenericFunctionCall } from "./index";

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

//** @deprecated Use `GenericFunctionCall` instead */
export type OpenAiFunctionCall = GenericFunctionCall;

// OpenAI Tool Calling Types
export interface OpenAIToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenAIAssistantToolCallMessage {
  role: "assistant";
  content: string | null;
  tool_calls: OpenAIToolCall[];
}

export interface OpenAIToolMessage {
  role: "tool";
  content: string;
  tool_call_id: string;
}

// OpenAI Content Types for messages
export interface OpenAITextContent {
  type: "text";
  text: string;
}

export interface OpenAIImageContent {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
}

export type OpenAIContentPart = OpenAITextContent | OpenAIImageContent;

/**
 * OpenAI message types
 */
export interface OpenAIMessage {
  role: "system" | "user" | "assistant" | "function" | "tool";
  content: string | null | OpenAIContentPart[];
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}
