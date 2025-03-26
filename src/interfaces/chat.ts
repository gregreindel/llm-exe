export type IChatMessageRole =
  | "system"
  | "assistant"
  | "developer"
  | "user"
  | "function"
  | "function_call";
  
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

export interface IChatDeveloperMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "developer">;
  content: string;
}

export interface IChatMessagesPlaceholder {
  role: "placeholder";
  content: string;
}

export type IPromptMessages = (IChatSystemMessage | IChatMessagesPlaceholder)[];

export type IPromptChatMessages = (
  | IChatUserMessage
  | IChatAssistantMessage
  | IChatAssistantFunctionCallMessage
  | IChatSystemMessage
  | IChatDeveloperMessage
  | IChatMessagesPlaceholder
  | IChatFunctionMessage
)[];

export type IChatMessage =
  | IChatUserMessage
  | IChatAssistantMessage
  | IChatAssistantFunctionCallMessage
  | IChatSystemMessage
  | IChatDeveloperMessage
  | IChatFunctionMessage;

export type IChatMessages = IChatMessage[];

export type PromptTemplateHistoryToken = `{{>DialogueHistory key='${string}'}}`;
