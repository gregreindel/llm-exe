import { CallableExecutorCore } from "./index";
import { IChatMessageRole } from "./chat";

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

export interface LlmExecutorExecuteOptions {
  functions?: CallableExecutorCore[];
  functionCall?: any;
  jsonSchema?: Record<string, any>
}

export type GenericFunctionCall = "auto" | "none" | "any" | { name: string };
export interface OpenAiLlmExecutorOptions<
  T extends GenericFunctionCall = "auto"
> extends LlmExecutorExecuteOptions {
  functions?: CallableExecutorCore[];
  functionCall?: T;
  functionCallStrictInput?: boolean;
  jsonSchema?: Record<string, any>
}
