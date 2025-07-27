import {
  OutputResult,
  OutputResultsFunction,
  OutputResultsText,
  IChatMessage,
  IChatUserMessage,
  IChatAssistantMessage,
  IChatSystemMessage,
} from "@/interfaces";

export function isOutputResult(obj: any): obj is OutputResult {
  return !!(
    obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "stopReason" in obj &&
    "content" in obj &&
    Array.isArray(obj.content)
  );
}

export function isOutputResultContentText(obj: any): obj is OutputResultsText {
  return !!(
    obj &&
    typeof obj === "object" &&
    "text" in obj &&
    "type" in obj &&
    obj.type === "text" &&
    typeof obj.text === "string"
  );
}

/**
 * Does a llm response have a tool/function call?
 */
export function isFunctionCall(result: any): result is OutputResultsFunction {
  return !!(
    result &&
    typeof result === "object" &&
    "functionId" in result &&
    "type" in result &&
    result.type === "function_use"
  );
}
export function isToolCall(result: any): result is OutputResultsFunction {
  return isFunctionCall(result);
}

/**
 * Is it a tool/function Call
 */
export function hasFunctionCall(results: any): boolean {
  return !!(results && Array.isArray(results) && results.some(isToolCall));
}
export function hasToolCall(results: any): boolean {
  return hasFunctionCall(results);
}

// Chat message type guards
export function isUserMessage(
  message: IChatMessage
): message is IChatUserMessage {
  return message.role === "user";
}

export function isAssistantMessage(
  message: IChatMessage
): message is IChatAssistantMessage {
  return message.role === "assistant" || message.role === "model";
}

export function isSystemMessage(
  message: IChatMessage
): message is IChatSystemMessage {
  return message.role === "system";
}
