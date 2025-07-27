export type IChatMessageRole =
  | "system"
  | "model"
  | "assistant"
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
  id?: string;
  role: Extract<IChatMessageRole, "function">;
  content: string;
  name: string;
}

export interface IChatAssistantMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "assistant" | "model">;
  content: string;
  function_call?: undefined;
}

export interface IChatFunctionCallMessage extends IChatMessageBase {
  role: Extract<IChatMessageRole, "function_call">;
  content: null;
  function_call: { name: string; arguments: string; id?: string };
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

export type IPromptChatMessages = (
  | IChatUserMessage
  | IChatAssistantMessage
  | IChatFunctionCallMessage
  | IChatSystemMessage
  | IChatMessagesPlaceholder
  | IChatFunctionMessage
)[];

export type IChatMessage =
  | IChatUserMessage
  | IChatAssistantMessage
  | IChatFunctionCallMessage
  | IChatSystemMessage
  | IChatFunctionMessage;

export type IChatMessages = IChatMessage[];

export type PromptTemplateHistoryToken = `{{>DialogueHistory key='${string}'}}`;
