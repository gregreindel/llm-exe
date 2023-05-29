export type IChatMessageRole = "system" | "assistant" | "user";

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

export type IChatMessages = (
  | IChatUserMessage
  | IChatAssistantMessage
  | IChatSystemMessage
)[];
