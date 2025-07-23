import type { InternalMessage, MessageMetadata } from "@/types";

export type IChatMessageRole =
  | "system"
  | "model"
  | "assistant"
  | "user"
  | "function"
  | "function_call"
  | "tool";
export type FinishReasons = "function_call" | "stop";

export interface IChatMessageContentDetailed {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface IChatMessageBase {
  role: IChatMessageRole;
  content: string | null | IChatMessageContentDetailed[];
  /**
   * Optional metadata for message conversion tracking
   * Used internally by the conversion system
   */
  _meta?: MessageMetadata;
}

export interface IChatUserMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "user">;
  content: string | IChatMessageContentDetailed[];
  name?: string;
}

export interface IChatFunctionMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "function">;
  content: string;
  name: string;
  tool_call_id?: string;
}

export interface IChatToolMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "tool">;
  content: string;
  tool_call_id: string;
}

export interface IChatAssistantMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "assistant">;
  content: string;
  function_call?: undefined;
}

export interface IChatAssistantFunctionCallMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "assistant">;
  content: null;
  function_call?: { name: string; arguments: string };
}

export interface IChatSystemMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "system">;
  content: string;
}

export interface IChatMessagesPlaceholder {
  role: "placeholder";
  content: string;
}

export type IPromptMessages = (IChatSystemMessage | IChatMessagesPlaceholder)[];

export type IPromptChatMessages = InternalMessage[];
// (
//   | IChatUserMessage
//   | IChatAssistantMessage
//   | IChatAssistantFunctionCallMessage
//   | IChatSystemMessage
//   | IChatMessagesPlaceholder
//   | IChatFunctionMessage
// )[];

export type IChatMessage =
  | IChatUserMessage
  | IChatAssistantMessage
  | IChatAssistantFunctionCallMessage
  | IChatSystemMessage
  | IChatFunctionMessage
  | IChatToolMessage;

export type IChatMessages = IChatMessage[];

export type PromptTemplateHistoryToken = `{{>DialogueHistory key='${string}'}}`;
