export type IChatMessageRole = "system" | "assistant" | "user" | "function";

export interface IChatMessageBase {
  role: IChatMessageRole;
  content: string;
}

export interface IChatUserMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "user">;
  content: string;
  name?: string;
}

export interface IChatAssistantMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "assistant">;
  content: string;
}

export interface IChatSystemMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "system">;
  content: string;
}

export interface IChatMessagesPlaceholder {
  role: "placeholder",
  content: string
}

export type IPromptMessages = (
  | IChatSystemMessage
  | IChatMessagesPlaceholder
)[];


export type IPromptChatMessages = (
  | IChatUserMessage
  | IChatAssistantMessage
  | IChatSystemMessage
  | IChatMessagesPlaceholder
)[];

export type IChatMessage = (
  | IChatUserMessage
  | IChatAssistantMessage
  | IChatSystemMessage
)

export type IChatMessages = (
  | IChatUserMessage
  | IChatAssistantMessage
  | IChatSystemMessage
)[];

export type PromptTemplateHistoryToken = `{{>DialogueHistory key='${string}'}}`
