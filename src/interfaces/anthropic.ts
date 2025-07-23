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
}

export interface AnthropicTextContent {
  type: 'text';
  text: string;
}

export interface AnthropicAssistantToolMessage {
  role: 'assistant';
  content: Array<AnthropicTextContent | AnthropicToolUseContent>;
}

export interface AnthropicUserToolResultMessage {
  role: 'user';
  content: Array<AnthropicTextContent | AnthropicToolResultContent>;
}

export type AnthropicMessage = 
  | AnthropicAssistantToolMessage
  | AnthropicUserToolResultMessage;