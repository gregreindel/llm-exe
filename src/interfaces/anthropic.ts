// Anthropic-specific types

export type AnthropicModelName = 
  | "claude-3-opus-20240229"
  | "claude-3-sonnet-20240229"
  | "claude-3-haiku-20240307"
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022"
  | `claude-${string}`;

// Anthropic Tool Use Types
export interface AnthropicToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: any;
}

export interface AnthropicToolResultContent {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export interface AnthropicTextContent {
  type: 'text';
  text: string;
}

export interface AnthropicImageContent {
  type: 'image';
  source: {
    type: 'base64' | 'url';
    media_type: string;
    data?: string;
    url?: string;
  };
}

// Basic message types
export interface AnthropicSystemMessage {
  role: 'system';
  content: string | Array<AnthropicTextContent>;
}

export interface AnthropicUserMessage {
  role: 'user';
  content: string | Array<AnthropicTextContent | AnthropicImageContent | AnthropicToolResultContent>;
}

export interface AnthropicAssistantMessage {
  role: 'assistant';
  content: string | Array<AnthropicTextContent | AnthropicToolUseContent>;
}

// Legacy aliases for backward compatibility
export interface AnthropicAssistantToolMessage extends AnthropicAssistantMessage {}
export interface AnthropicUserToolResultMessage extends AnthropicUserMessage {}

export type AnthropicMessage = 
  | AnthropicSystemMessage
  | AnthropicUserMessage
  | AnthropicAssistantMessage;