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
  InternalMessage,
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

/**
 * Detect the provider format of messages
 */
export function detectProvider(message: any): ProviderDetectionResult {
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

  // Try to infer from role patterns

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
 * Round-trip conversion test
 * Useful for testing that messages can be converted back and forth without loss
 */
export function testRoundTrip(
  messages: any[],
  provider?: "openai" | "anthropic" | "gemini",
  options?: ConverterOptions
): {
  success: boolean;
  provider: string;
  internal: InternalMessage[];
  roundTrip: any[];
  matches: boolean;
  error?: Error;
} {
  try {
    // Detect provider if not specified
    const detectedProvider = provider || detectProvider(messages).provider;

    if (detectedProvider === "unknown") {
      throw new Error("Could not detect provider format");
    }

    // Convert to internal
    const internal = toInternal(messages, {
      ...options,
      provider: detectedProvider,
    });

    // Convert back
    const roundTrip = fromInternal(internal, detectedProvider as any, options);

    // Check if they match
    const originalJson = JSON.stringify(messages);
    const roundTripJson = JSON.stringify(roundTrip);
    const matches = originalJson === roundTripJson;

    return {
      success: true,
      provider: detectedProvider,
      internal,
      roundTrip,
      matches,
    };
  } catch (error) {
    return {
      success: false,
      provider: provider || "unknown",
      internal: [],
      roundTrip: [],
      matches: false,
      error: error as Error,
    };
  }
}

/**
 * Extract text content from messages regardless of format
 * Useful for getting a simple text representation
 */
export function extractTextContent(messages: any[]): string {
  try {
    // Convert to internal format first
    const internal = toInternal(messages);

    // Extract text from internal messages
    return internal
      .filter((msg) => msg.content !== null)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");
  } catch (error) {
    // Fallback to direct extraction
    return messages
      .map((msg) => {
        const role = msg.role || "unknown";
        let content = "";

        if (typeof msg.content === "string") {
          content = msg.content;
        } else if (Array.isArray(msg.content)) {
          // Anthropic format
          content = msg.content
            .filter((c: any) => c.type === "text")
            .map((c: any) => c.text)
            .join(" ");
        } else if (Array.isArray(msg.parts)) {
          // Gemini format
          content = msg.parts
            .filter((p: any) => "text" in p)
            .map((p: any) => p.text)
            .join(" ");
        }

        return content ? `${role}: ${content}` : null;
      })
      .filter(Boolean)
      .join("\n");
  }
}

/**
 * Count tool/function calls in messages
 */
export function countToolCalls(messages: any[]): number {
  try {
    const internal = toInternal(messages);
    return internal.filter((msg) => msg.function_call !== undefined).length;
  } catch {
    // Direct count as fallback
    let count = 0;

    messages.forEach((msg) => {
      // OpenAI
      if (msg.tool_calls) {
        count += msg.tool_calls.length;
      } else if (msg.function_call) {
        count += 1;
      }
      // Anthropic
      else if (Array.isArray(msg.content)) {
        count += msg.content.filter((c: any) => c.type === "tool_use").length;
      }
      // Gemini
      else if (Array.isArray(msg.parts)) {
        count += msg.parts.filter((p: any) => "functionCall" in p).length;
      }
    });

    return count;
  }
}

/**
 * Utility to create a message group ID
 */
export function createGroupId(): string {
  return `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
    message.content.every((part: any) => 
      typeof part === 'object' && 
      'type' in part && 
      (part.type === 'text' || part.type === 'image' || part.type === 'audio' || part.type === 'video' || part.type === 'document')
    )
  ) {
    // Also check if it has the right structure for internal format
    return false;
  }

  // If content is string or null, it needs conversion
  return true;
}
