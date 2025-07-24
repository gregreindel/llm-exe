import {
  detectProvider,
  toInternal,
  fromInternal,
  needsConversion,
} from "./index";
import { ConversionError } from "./types";
import { InternalMessage } from "@/types";

describe("detectProvider", () => {
  test("detects invalid message structure", () => {
    expect(detectProvider(null)).toEqual({
      provider: "unknown",
      confidence: 0,
      reason: "Invalid message structure - not an object",
    });

    expect(detectProvider(undefined)).toEqual({
      provider: "unknown",
      confidence: 0,
      reason: "Invalid message structure - not an object",
    });

    expect(detectProvider("string")).toEqual({
      provider: "unknown",
      confidence: 0,
      reason: "Invalid message structure - not an object",
    });

    expect(detectProvider({})).toEqual({
      provider: "unknown",
      confidence: 0,
      reason: "Invalid message structure - missing or invalid role",
    });

    expect(detectProvider({ role: null })).toEqual({
      provider: "unknown",
      confidence: 0,
      reason: "Invalid message structure - missing or invalid role",
    });

    expect(detectProvider({ role: 123 })).toEqual({
      provider: "unknown",
      confidence: 0,
      reason: "Invalid message structure - missing or invalid role",
    });
  });

  test("detects OpenAI format with high confidence", () => {
    const openAIMessage = {
      role: "user",
      content: "Hello",
      tool_calls: [{ id: "1", type: "function" }],
    };

    expect(detectProvider(openAIMessage)).toEqual({
      provider: "openai",
      confidence: 0.95,
      reason:
        "Found OpenAI-specific fields (tool_calls, tool_call_id, or tool role)",
    });
  });

  test("detects Anthropic format with high confidence", () => {
    const anthropicMessage = {
      role: "user",
      content: [{ type: "text", text: "Hello" }],
    };

    expect(detectProvider(anthropicMessage)).toEqual({
      provider: "anthropic",
      confidence: 0.95,
      reason: "Found Anthropic content array format",
    });
  });

  test("detects Gemini format with high confidence", () => {
    const geminiMessage = {
      role: "model",
      text: "Hello from Gemini",
    };

    expect(detectProvider(geminiMessage)).toEqual({
      provider: "gemini",
      confidence: 0.95,
      reason: "Found Gemini parts array or model role",
    });
  });

  test("detects Gemini model role with medium confidence", () => {
    const geminiMessage = {
      role: "model",
      content: "Hello",
    };

    expect(detectProvider(geminiMessage)).toEqual({
      provider: "gemini",
      confidence: 0.95,
      reason: "Found Gemini parts array or model role",
    });
  });

  test("detects model role inference with medium confidence", () => {
    const messageWithModelRole = {
      role: "model-assistant",
      content: "Hello",
    };

    expect(detectProvider(messageWithModelRole)).toEqual({
      provider: "gemini",
      confidence: 0.8,
      reason: "Found model role (Gemini-specific)",
    });
  });

  test("detects tool role inference with medium confidence", () => {
    const messageWithToolRole = {
      role: "tool-response",
      content: "Result",
    };

    expect(detectProvider(messageWithToolRole)).toEqual({
      provider: "openai",
      confidence: 0.8,
      reason: "Found tool role (OpenAI-specific)",
    });
  });

  test("detects tool role as OpenAI with medium confidence", () => {
    const toolMessage = {
      role: "tool",
      content: "Result",
    };

    expect(detectProvider(toolMessage)).toEqual({
      provider: "openai",
      confidence: 0.95,
      reason:
        "Found OpenAI-specific fields (tool_calls, tool_call_id, or tool role)",
    });
  });

  test("returns unknown for unrecognizable format", () => {
    const unknownMessage = {
      role: "assistant",
      content: "Hello",
    };

    expect(detectProvider(unknownMessage)).toEqual({
      provider: "unknown",
      confidence: 0,
      reason: "Could not detect provider format",
    });
  });
});

describe("toInternal", () => {
  test("throws ConversionError for invalid input", () => {
    expect(() => toInternal(null)).toThrow(ConversionError);
    expect(() => toInternal(undefined)).toThrow(ConversionError);
    expect(() => toInternal("string")).toThrow(ConversionError);
    expect(() => toInternal({})).toThrow(ConversionError);
    expect(() => toInternal({ role: null })).toThrow(ConversionError);
    expect(() => toInternal({ role: 123 })).toThrow(ConversionError);
  });

  test("returns internal format unchanged when already internal", () => {
    const internalMessage: InternalMessage = {
      role: "user",
      content: [{ type: "text", text: "Hello" }],
    };

    const result = toInternal(internalMessage);
    expect(result).toEqual([internalMessage]);
  });

  test("adds metadata when provider specified for internal format", () => {
    const internalMessage: InternalMessage = {
      role: "user",
      content: [{ type: "text", text: "Hello" }],
    };

    const result = toInternal(internalMessage, { provider: "openai" });
    expect(result).toMatchObject({
      ...internalMessage,
      _meta: { original: { provider: "openai" } },
    });
  });

  test("converts OpenAI format to internal", () => {
    const openAIMessage = {
      role: "user",
      content: "Hello",
    };

    const result = toInternal(openAIMessage);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
    expect(Array.isArray(result[0].content)).toBe(true);
  });

  test("converts Anthropic format to internal", () => {
    const anthropicMessage = {
      role: "user",
      content: [{ type: "text", text: "Hello" }],
    };

    const result = toInternal(anthropicMessage);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
    expect(Array.isArray(result[0].content)).toBe(true);
  });

  test("converts Gemini format to internal", () => {
    const geminiMessage = {
      role: "model",
      parts: [{ text: "Hello from Gemini" }],
    };

    const result = toInternal(geminiMessage);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("assistant"); // Gemini "model" role becomes "assistant"
    expect(Array.isArray(result[0].content)).toBe(true);
  });

  test("uses specified provider option", () => {
    const message = {
      role: "user",
      content: "Hello",
    };

    const result = toInternal(message, { provider: "openai" });
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
  });

  test("uses specified anthropic provider option", () => {
    const message = {
      role: "user",
      content: "Hello",
    };

    const result = toInternal(message, { provider: "anthropic" });
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
  });

  test("uses specified gemini provider option", () => {
    const message = {
      role: "user",
      parts: [{ text: "Hello" }],
    };

    const result = toInternal(message, { provider: "gemini" });
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
  });

  test("defaults to OpenAI for unknown format", () => {
    const unknownMessage = {
      role: "assistant",
      content: "Hello",
    };

    const result = toInternal(unknownMessage);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("assistant");
  });

  test("handles edge case for unknown provider gracefully", () => {
    // In practice, detectProvider will always return a known provider or "unknown"
    // which gets handled by the "unknown" case that defaults to OpenAI format
    // This test documents the current behavior
    const unknownMessage = {
      role: "assistant",
      content: "Hello from unknown provider",
    };

    const result = toInternal(unknownMessage);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("assistant");
    expect(Array.isArray(result[0].content)).toBe(true);
  });

  test("throws error for invalid provider option", () => {
    // Test the default case by providing an invalid provider
    const message = {
      role: "user",
      content: "Test message",
    };

    // @ts-expect-error invalid provider
    expect(() => toInternal(message, { provider: "invalid-provider" })).toThrow(
      "Could not detect provider format. Please specify provider in options."
    );
  });
});

describe("fromInternal", () => {
  const internalMessage: InternalMessage = {
    role: "user",
    content: [{ type: "text", text: "Hello" }],
  };

  test("converts to OpenAI format", () => {
    const result = fromInternal([internalMessage], "openai");
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("role", "user");
    expect(result[0]).toHaveProperty("content");
  });

  test("converts to Anthropic format", () => {
    const result = fromInternal([internalMessage], "anthropic");
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("role", "user");
    expect(result[0]).toHaveProperty("content");
  });

  test("converts to Gemini format", () => {
    const result = fromInternal([internalMessage], "gemini");
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("role", "user");
  });

  test("throws error for unknown provider", () => {
    expect(() => fromInternal([internalMessage], "invalid" as any)).toThrow(
      ConversionError
    );
    expect(() => fromInternal([internalMessage], "invalid" as any)).toThrow(
      "Unknown provider: invalid"
    );
  });
});

describe("needsConversion", () => {
  test("returns false for internal format with ContentPart array", () => {
    const internalMessage = {
      role: "user",
      content: [
        { type: "text", text: "Hello" },
        { type: "image", url: "..." },
      ],
    };

    expect(needsConversion(internalMessage)).toBe(false);
  });

  test("returns true for string content", () => {
    const message = {
      role: "user",
      content: "Hello world",
    };

    expect(needsConversion(message)).toBe(true);
  });

  test("returns true for null content", () => {
    const message = {
      role: "user",
      content: null,
    };

    expect(needsConversion(message)).toBe(true);
  });

  test("returns true for empty content array", () => {
    const message = {
      role: "user",
      content: [],
    };

    expect(needsConversion(message)).toBe(true);
  });

  test("returns true for non-ContentPart array", () => {
    const message = {
      role: "user",
      content: ["string item", { notAContentPart: true }],
    };

    expect(needsConversion(message)).toBe(true);
  });

  test("returns true for array with invalid ContentPart types", () => {
    const message = {
      role: "user",
      content: [{ type: "invalid", text: "Hello" }],
    };

    expect(needsConversion(message)).toBe(true);
  });

  test("returns false for valid mixed ContentPart types", () => {
    const message = {
      role: "user",
      content: [
        { type: "text", text: "Hello" },
        { type: "image", url: "image.jpg" },
        { type: "audio", url: "audio.mp3" },
        { type: "video", url: "video.mp4" },
        { type: "document", url: "doc.pdf" },
      ],
    };

    expect(needsConversion(message)).toBe(false);
  });

  test("returns true for undefined message", () => {
    expect(needsConversion(undefined)).toBe(true);
  });

  test("returns true for null message", () => {
    expect(needsConversion(null)).toBe(true);
  });

  test("returns true for message without content property", () => {
    const message = {
      role: "user",
    };

    expect(needsConversion(message)).toBe(true);
  });
});
