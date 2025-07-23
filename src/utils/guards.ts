/**
 * Type guards for provider-specific message formats
 * These help identify and handle messages from different LLM providers
 */

import {
  OpenAIAssistantToolCallMessage,
  OpenAIToolMessage,
} from "@/interfaces/openai";

import {
  AnthropicAssistantToolMessage,
  AnthropicUserToolResultMessage,
  AnthropicToolUseContent,
  AnthropicToolResultContent,
} from "@/interfaces/anthropic";

import {
  GeminiModelMessage,
  GeminiUserMessage,
  GeminiFunctionCallPart,
  GeminiFunctionResponsePart,
} from "@/interfaces/gemini";
import { InternalMessage } from "@/converters/types";

// OpenAI
export function isOpenAIAssistantToolCallMessage(
  msg: any
): msg is OpenAIAssistantToolCallMessage {
  return !!(
    msg &&
    typeof msg === "object" &&
    msg.role === "assistant" &&
    Array.isArray(msg.tool_calls) &&
    msg.tool_calls.length > 0 &&
    msg.tool_calls.every(
      (tc: any) =>
        tc &&
        typeof tc === "object" &&
        tc.type === "function" &&
        tc.function &&
        typeof tc.function.name === "string" &&
        typeof tc.function.arguments === "string"
    )
  );
}

export function isOpenAIToolMessage(msg: any): msg is OpenAIToolMessage {
  return !!(
    msg &&
    typeof msg === "object" &&
    msg.role === "tool" &&
    typeof msg.content === "string" &&
    typeof msg.tool_call_id === "string"
  );
}

// Anthropic
export function isAnthropicAssistantToolMessage(
  msg: any
): msg is AnthropicAssistantToolMessage {
  return !!(
    msg &&
    typeof msg === "object" &&
    msg.role === "assistant" &&
    Array.isArray(msg.content) &&
    msg.content.some((c: any) => c && c.type === "tool_use")
  );
}

export function isAnthropicUserToolResultMessage(
  msg: any
): msg is AnthropicUserToolResultMessage {
  return !!(
    msg &&
    typeof msg === "object" &&
    msg.role === "user" &&
    Array.isArray(msg.content) &&
    msg.content.some((c: any) => c && c.type === "tool_result")
  );
}

export function isAnthropicToolUseContent(
  content: any
): content is AnthropicToolUseContent {
  return !!(
    content &&
    typeof content === "object" &&
    content.type === "tool_use" &&
    typeof content.id === "string" &&
    typeof content.name === "string" &&
    "input" in content
  );
}

export function isAnthropicToolResultContent(
  content: any
): content is AnthropicToolResultContent {
  return !!(
    content &&
    typeof content === "object" &&
    content.type === "tool_result" &&
    typeof content.tool_use_id === "string" &&
    typeof content.content === "string"
  );
}

// Gemini
export function isGeminiModelMessage(msg: any): msg is GeminiModelMessage {
  return !!(
    msg &&
    typeof msg === "object" &&
    msg.role === "model" &&
    Array.isArray(msg.parts) &&
    msg.parts.length > 0
  );
}

export function isGeminiUserMessage(msg: any): msg is GeminiUserMessage {
  return !!(
    msg &&
    typeof msg === "object" &&
    msg.role === "user" &&
    Array.isArray(msg.parts)
  );
}

export function isGeminiFunctionCall(
  part: any
): part is GeminiFunctionCallPart {
  return !!(
    part &&
    typeof part === "object" &&
    part.functionCall &&
    typeof part.functionCall.name === "string" &&
    "args" in part.functionCall
  );
}

export function isGeminiFunctionResponse(
  part: any
): part is GeminiFunctionResponsePart {
  return !!(
    part &&
    typeof part === "object" &&
    part.functionResponse &&
    typeof part.functionResponse.name === "string" &&
    part.functionResponse.response &&
    "result" in part.functionResponse.response
  );
}

// Utility guards to identify provider format
export function hasOpenAIToolFormat(messages: any[]): boolean {
  return (
    Array.isArray(messages) &&
    messages.some(
      (msg) => isOpenAIAssistantToolCallMessage(msg) || isOpenAIToolMessage(msg)
    )
  );
}

export function hasAnthropicToolFormat(messages: any[]): boolean {
  return (
    Array.isArray(messages) &&
    messages.some(
      (msg) =>
        isAnthropicAssistantToolMessage(msg) ||
        isAnthropicUserToolResultMessage(msg)
    )
  );
}

export function hasGeminiFormat(messages: any[]): boolean {
  return (
    Array.isArray(messages) &&
    messages.some(
      (msg) =>
        isGeminiModelMessage(msg) ||
        (isGeminiUserMessage(msg) && msg.role === "user")
    )
  );
}

// Legacy format guards (for our internal format)
export function hasLegacyFunctionCallFormat(msg: any): msg is InternalMessage {
  return !!(
    msg &&
    typeof msg === "object" &&
    msg.role === "assistant" &&
    msg.function_call &&
    typeof msg.function_call.name === "string" &&
    typeof msg.function_call.arguments === "string"
  );
}

export function isLegacyFunctionMessage(msg: any): boolean {
  return !!(
    msg &&
    typeof msg === "object" &&
    msg.role === "function" &&
    typeof msg.name === "string" &&
    typeof msg.content === "string"
  );
}

export function isPlaceholderMessage(msg: any): msg is {
  role: "placeholder";
  content: [
    {
      type: "text";
      text: string;
    },
  ];
} {
  return msg.role === "placeholder";
}
