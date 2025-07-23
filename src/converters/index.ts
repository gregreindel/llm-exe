export {
  openAIMessageToInternal,
  internalMessagesToOpenAI,
  isOpenAIFormat,
} from "./providers/openai";

export {
  anthropicMessageToInternal,
  internalMessagesToAnthropic,
  isAnthropicFormat,
} from "./providers/anthropic";

export {
  geminiMessageToInternal,
  internalMessagesToGemini,
  isGeminiFormat,
  type GeminiMessage,
} from "./providers/gemini";

import {
  ConverterOptions,
  ConversionError,
  ProviderDetectionResult,
} from "./types";

import {
  openAIMessageToInternal,
  internalMessagesToOpenAI,
  isOpenAIFormat,
} from "./providers/openai";

import {
  anthropicMessageToInternal,
  internalMessagesToAnthropic,
  isAnthropicFormat,
} from "./providers/anthropic";

import {
  geminiMessageToInternal,
  internalMessagesToGemini,
  isGeminiFormat,
} from "./providers/gemini";
import { InternalMessage } from "@/types";

/**
 * Detect the provider format of messages
 */
export function detectProvider(message: any): ProviderDetectionResult {
  // Add null/undefined checks first
  if (!message || typeof message !== "object") {
    return {
      provider: "unknown",
      confidence: 0,
      reason: "Invalid message structure - not an object",
    };
  }

  if (!message.role || typeof message.role !== "string") {
    return {
      provider: "unknown",
      confidence: 0,
      reason: "Invalid message structure - missing or invalid role",
    };
  }

  // Check for provider-specific formats
  if (isOpenAIFormat(message)) {
    return {
      provider: "openai",
      confidence: 0.95,
      reason:
        "Found OpenAI-specific fields (tool_calls, tool_call_id, or tool role)",
    };
  }

  if (isAnthropicFormat(message)) {
    return {
      provider: "anthropic",
      confidence: 0.95,
      reason: "Found Anthropic content array format",
    };
  }

  if (isGeminiFormat(message)) {
    return {
      provider: "gemini",
      confidence: 0.95,
      reason: "Found Gemini parts array or model role",
    };
  }

  // Try to infer from role patterns (now safe because we checked message.role above)
  if (message.role.includes("model")) {
    return {
      provider: "gemini",
      confidence: 0.8,
      reason: "Found model role (Gemini-specific)",
    };
  }

  if (message.role.includes("tool")) {
    return {
      provider: "openai",
      confidence: 0.8,
      reason: "Found tool role (OpenAI-specific)",
    };
  }

  // Default to unknown
  return {
    provider: "unknown",
    confidence: 0,
    reason: "Could not detect provider format",
  };
}

/**
 * Convert messages from any provider format to internal format
 * Automatically detects the provider if not specified
 */
export function toInternal(
  message: any,
  options: ConverterOptions & {
    provider?: "openai" | "anthropic" | "gemini";
  } = {}
): InternalMessage[] {
  // Input validation
  if (!message || typeof message !== "object") {
    throw new ConversionError("Message must be a valid object", "unknown");
  }

  if (!message.role || typeof message.role !== "string") {
    throw new ConversionError("Message must have a valid role", "unknown");
  }

  // Check if already in internal format (no conversion needed)
  if (!needsConversion(message)) {
    // If provider specified, add metadata
    if (options.provider) {
      return {
        ...message,
        _meta: message._meta || { original: { provider: options.provider } },
      };
    }
    // Return as-is, it's already internal format
    return [message];
  }

  // Detect provider if not specified
  const detection = detectProvider(message);
  const provider = options.provider || detection.provider;

  switch (provider) {
    case "openai":
      return openAIMessageToInternal(message, options);

    case "anthropic":
      return anthropicMessageToInternal(message, options);

    case "gemini":
      return geminiMessageToInternal(message, options);

    case "unknown":
      // For generic messages without provider-specific features,
      // treat as OpenAI format (the simplest/most common format)
      return openAIMessageToInternal(message, options);

    default:
      throw new ConversionError(
        "Could not detect provider format. Please specify provider in options.",
        "unknown"
      );
  }
}

/**
 * Convert internal messages to specified provider format
 */
export function fromInternal(
  messages: InternalMessage[],
  provider: "openai" | "anthropic" | "gemini",
  options: ConverterOptions = {}
): any[] {
  switch (provider) {
    case "openai":
      return internalMessagesToOpenAI(messages, options);

    case "anthropic":
      return internalMessagesToAnthropic(messages, options);

    case "gemini":
      return internalMessagesToGemini(messages, options);

    default:
      throw new ConversionError(`Unknown provider: ${provider}`, provider);
  }
}

/**
 * Check if messages need conversion (not already in internal format)
 */
export function needsConversion(message: any): boolean {
  // Check if already in internal format by looking for content structure

  // If content is already a ContentPart array, it's internal format
  if (
    Array.isArray(message?.content) &&
    message.content.length > 0 &&
    message.content.every(
      (part: any) =>
        typeof part === "object" &&
        "type" in part &&
        (part.type === "text" ||
          part.type === "image" ||
          part.type === "audio" ||
          part.type === "video" ||
          part.type === "document")
    )
  ) {
    // Also check if it has the right structure for internal format
    return false;
  }

  // If content is string or null, it needs conversion
  return true;
}
