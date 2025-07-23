/**
 * Shared Test Messages for Provider Converters
 * 
 * This file contains a comprehensive set of test messages that can be used
 * across all provider test files to ensure consistent and exhaustive testing.
 * Each message type includes expected outputs for each provider.
 */

import { InternalMessage } from "@/interfaces";
import { OpenAIMessage } from "@/interfaces/openai";
import { AnthropicMessage } from "@/interfaces/anthropic";
import { GeminiMessage } from "@/interfaces/gemini";

export interface TestMessage {
  name: string;
  description?: string;
  internal: InternalMessage[];
  openai?: OpenAIMessage | OpenAIMessage[];
  anthropic?: AnthropicMessage | AnthropicMessage[];
  gemini?: GeminiMessage | GeminiMessage[];
  skipProviders?: string[]; // Providers that don't support this message type
  skipRoundTrip?: boolean; // If the message can't round-trip perfectly
}

// Helper to create test messages
function createTestMessage(
  name: string,
  internal: InternalMessage[],
  providers: {
    openai?: OpenAIMessage | OpenAIMessage[];
    anthropic?: AnthropicMessage | AnthropicMessage[];
    gemini?: GeminiMessage | GeminiMessage[];
  },
  options?: {
    description?: string;
    skipProviders?: string[];
    skipRoundTrip?: boolean;
  }
): TestMessage {
  return {
    name,
    internal,
    ...providers,
    ...options,
  };
}

export const sharedTestMessages: TestMessage[] = [
  // Basic text messages
  createTestMessage(
    "system message with text",
    [
      {
        role: "system",
        content: [{ type: "text", text: "You are a helpful assistant." }],
      },
    ],
    {
      openai: { role: "system", content: "You are a helpful assistant." },
      anthropic: {
        role: "system",
        content: "You are a helpful assistant.",  // String content since wasArray metadata is not preserved
      },
      gemini: {
        role: "system",
        parts: [{ text: "You are a helpful assistant." }],
      },
    }
  ),

  createTestMessage(
    "user message with text",
    [
      {
        role: "user",
        content: [{ type: "text", text: "Hello, world!" }],
      },
    ],
    {
      openai: { role: "user", content: "Hello, world!" },
      anthropic: {
        role: "user",
        content: [{ type: "text", text: "Hello, world!" }],
      },
      gemini: {
        role: "user",
        parts: [{ text: "Hello, world!" }],
      },
    }
  ),

  createTestMessage(
    "assistant message with text",
    [
      {
        role: "assistant",
        content: [{ type: "text", text: "Hi there! How can I help?" }],
      },
    ],
    {
      openai: { role: "assistant", content: "Hi there! How can I help?" },
      anthropic: {
        role: "assistant",
        content: [{ type: "text", text: "Hi there! How can I help?" }],
      },
      gemini: {
        role: "model",
        parts: [{ text: "Hi there! How can I help?" }],
      },
    }
  ),

  // Messages with names
  createTestMessage(
    "user message with name",
    [
      {
        role: "user",
        content: [{ type: "text", text: "Hello from Alice" }],
        name: "Alice",
      },
    ],
    {
      openai: { role: "user", content: "Hello from Alice", name: "Alice" },
      anthropic: {
        role: "user",
        content: [{ type: "text", text: "Hello from Alice" }],
      },
      gemini: {
        role: "user",
        parts: [{ text: "Hello from Alice" }],
      },
    },
    {
      description: "OpenAI supports names, others store in metadata",
      skipRoundTrip: true, // Name lost in Anthropic/Gemini
    }
  ),

  // Empty/null content
  createTestMessage(
    "assistant message with empty content",
    [
      {
        role: "assistant",
        content: [],
      },
    ],
    {
      openai: { role: "assistant", content: null },
      anthropic: {
        role: "assistant",
        content: [],
      },
      gemini: {
        role: "model",
        parts: [],
      },
    }
  ),

  // Multiple text parts
  createTestMessage(
    "message with multiple text parts",
    [
      {
        role: "user",
        content: [
          { type: "text", text: "First part." },
          { type: "text", text: "Second part." },
        ],
      },
    ],
    {
      openai: {
        role: "user",
        content: [
          { type: "text", text: "First part." },
          { type: "text", text: "Second part." },
        ],
      },
      anthropic: {
        role: "user",
        content: [
          { type: "text", text: "First part." },
          { type: "text", text: "Second part." },
        ],
      },
      gemini: {
        role: "user",
        parts: [{ text: "First part." }, { text: "Second part." }],
      },
    }
  ),

  // Image content - URL
  createTestMessage(
    "user message with image URL",
    [
      {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          {
            type: "image",
            mediaType: "image/jpeg",
            source: { type: "url", url: "https://example.com/image.jpg" },
          },
        ],
      },
    ],
    {
      openai: {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          {
            type: "image_url",
            image_url: { url: "https://example.com/image.jpg" },
          },
        ],
      },
      anthropic: {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          {
            type: "image",
            source: {
              type: "url",
              url: "https://example.com/image.jpg",
              media_type: "image/jpeg",
            },
          },
        ],
      },
      gemini: {
        role: "user",
        parts: [
          { text: "What's in this image?" },
          {
            fileData: {
              mimeType: "image/jpeg",
              fileUri: "https://example.com/image.jpg",
            },
          },
        ],
      },
    },
    {
      description: "Image URLs are handled differently by each provider",
    }
  ),

  // Image content - Base64
  createTestMessage(
    "user message with base64 image",
    [
      {
        role: "user",
        content: [
          {
            type: "image",
            mediaType: "image/png",
            source: {
              type: "base64",
              data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            },
          },
        ],
      },
    ],
    {
      openai: {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            },
          },
        ],
      },
      anthropic: {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            },
          },
        ],
      },
      gemini: {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            },
          },
        ],
      },
    }
  ),

  // Function/Tool calls - Simple
  createTestMessage(
    "assistant with function call",
    [
      {
        role: "assistant",
        content: [],
        function_call: {
          name: "get_weather",
          arguments: '{"location": "NYC"}',
        },
      },
    ],
    {
      openai: {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "call_123",
            type: "function",
            function: {
              name: "get_weather",
              arguments: '{"location": "NYC"}',
            },
          },
        ],
      },
      anthropic: {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "toolu_123",
            name: "get_weather",
            input: { location: "NYC" },
          },
        ],
      },
      gemini: {
        role: "model",
        parts: [
          {
            functionCall: {
              name: "get_weather",
              args: { location: "NYC" },
            },
          },
        ],
      },
    },
    {
      skipRoundTrip: true, // IDs are generated
    }
  ),

  // Function response
  createTestMessage(
    "function response message",
    [
      {
        role: "function",
        name: "function",  // Tool messages get a generic name
        content: [{ type: "text", text: "72F and sunny" }],
        tool_call_id: "call_123",
      },
    ],
    {
      openai: {
        role: "tool",
        content: "72F and sunny",
        tool_call_id: "call_123",
      },
      anthropic: {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "toolu_123",
            content: "72F and sunny",
          },
        ],
      },
      gemini: {
        role: "function",
        parts: [
          {
            functionResponse: {
              name: "get_weather",
              response: { result: "72F and sunny" },
            },
          },
        ],
      },
    },
    {
      skipRoundTrip: true, // ID mapping varies
    }
  ),

  // Complex: Text + Function call
  createTestMessage(
    "assistant with text and function call",
    [
      {
        role: "assistant",
        content: [{ type: "text", text: "Let me check the weather for you." }],
        _meta: {
          group: {
            id: "group_123",
            position: 0,
            total: 2,
          },
        },
      },
      {
        role: "assistant",
        content: [],
        function_call: {
          name: "get_weather",
          arguments: '{"location": "Paris"}',
        },
        _meta: {
          group: {
            id: "group_123",
            position: 1,
            total: 2,
          },
        },
      },
    ],
    {
      openai: {
        role: "assistant",
        content: "Let me check the weather for you.",
        tool_calls: [
          {
            id: "call_456",
            type: "function",
            function: {
              name: "get_weather",
              arguments: '{"location": "Paris"}',
            },
          },
        ],
      },
      anthropic: {
        role: "assistant",
        content: [
          { type: "text", text: "Let me check the weather for you." },
          {
            type: "tool_use",
            id: "toolu_456",
            name: "get_weather",
            input: { location: "Paris" },
          },
        ],
      },
      gemini: [
        {
          role: "model",
          parts: [{ text: "Let me check the weather for you." }],
        },
        {
          role: "model",
          parts: [
            {
              functionCall: {
                name: "get_weather",
                args: { location: "Paris" },
              },
            },
          ],
        },
      ],
    },
    {
      skipRoundTrip: true,
    }
  ),

  // Multiple function calls
  createTestMessage(
    "assistant with multiple function calls",
    [
      {
        role: "assistant",
        content: [],
        function_call: {
          name: "get_weather",
          arguments: '{"location": "Tokyo"}',
        },
        _meta: {
          group: {
            id: "group_789",
            position: 0,
            total: 2,
          },
        },
      },
      {
        role: "assistant",
        content: [],
        function_call: {
          name: "get_time",
          arguments: '{"timezone": "JST"}',
        },
        _meta: {
          group: {
            id: "group_789",
            position: 1,
            total: 2,
          },
        },
      },
    ],
    {
      openai: {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "call_1",
            type: "function",
            function: {
              name: "get_weather",
              arguments: '{"location": "Tokyo"}',
            },
          },
          {
            id: "call_2",
            type: "function",
            function: {
              name: "get_time",
              arguments: '{"timezone": "JST"}',
            },
          },
        ],
      },
      anthropic: {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "toolu_1",
            name: "get_weather",
            input: { location: "Tokyo" },
          },
          {
            type: "tool_use",
            id: "toolu_2",
            name: "get_time",
            input: { timezone: "JST" },
          },
        ],
      },
      gemini: [
        {
          role: "model",
          parts: [
            {
              functionCall: {
                name: "get_weather",
                args: { location: "Tokyo" },
              },
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              functionCall: {
                name: "get_time",
                args: { timezone: "JST" },
              },
            },
          ],
        },
      ],
    },
    {
      skipRoundTrip: true,
    }
  ),

  // Edge cases
  createTestMessage(
    "empty content array",
    [
      {
        role: "user",
        content: [],
      },
    ],
    {
      openai: { role: "user", content: [] },
      anthropic: { role: "user", content: [] },
      gemini: { role: "user", parts: [] },
    }
  ),

  createTestMessage(
    "text with special characters",
    [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: 'Special chars: \n\t"quotes" & <tags> 🎉',
          },
        ],
      },
    ],
    {
      openai: {
        role: "user",
        content: 'Special chars: \n\t"quotes" & <tags> 🎉',
      },
      anthropic: {
        role: "user",
        content: [
          { type: "text", text: 'Special chars: \n\t"quotes" & <tags> 🎉' },
        ],
      },
      gemini: {
        role: "user",
        parts: [{ text: 'Special chars: \n\t"quotes" & <tags> 🎉' }],
      },
    }
  ),

  // Legacy function message (preserves name)
  createTestMessage(
    "function message with name (legacy)",
    [
      {
        role: "function",
        name: "get_weather",
        content: [{ type: "text", text: '{"temperature": 72}' }],
      },
    ],
    {
      openai: {
        role: "function",
        name: "get_weather",
        content: '{"temperature": 72}',
      },
    },
    {
      skipProviders: ["anthropic", "gemini"],
      description: "Legacy OpenAI function message format",
    }
  ),

  // Provider-specific features
  createTestMessage(
    "OpenAI legacy function_call",
    [
      {
        role: "assistant",
        content: [{ type: "text", text: "Checking weather..." }],
        function_call: {
          name: "get_weather",
          arguments: '{"location": "London"}',
        },
      },
    ],
    {
      openai: {
        role: "assistant",
        content: "Checking weather...",
        function_call: {
          name: "get_weather",
          arguments: '{"location": "London"}',
        },
      },
    },
    {
      skipProviders: ["anthropic", "gemini"],
      description: "Legacy OpenAI function_call format",
    }
  ),

  createTestMessage(
    "Anthropic tool result with error",
    [
      {
        role: "function",
        name: "get_weather",
        content: [{ type: "text", text: "Error: Location not found" }],
        tool_call_id: "toolu_error",
        _meta: {
          original: {
            is_error: true,
          },
        },
      },
    ],
    {
      anthropic: {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "toolu_error",
            content: "Error: Location not found",
            is_error: true,
          },
        ],
      },
    },
    {
      skipProviders: ["openai", "gemini"],
      description: "Anthropic-specific error handling",
    }
  ),
];

// Helper functions for test utilities
export function getTestMessagesForProvider(
  provider: "openai" | "anthropic" | "gemini"
): TestMessage[] {
  return sharedTestMessages.filter(
    (msg) => !msg.skipProviders?.includes(provider) && msg[provider]
  );
}

export function getInternalToProviderTestCases(
  provider: "openai" | "anthropic" | "gemini"
): Array<{
  name: string;
  input: InternalMessage[];
  expected: any;
  skipRoundTrip?: boolean;
}> {
  return getTestMessagesForProvider(provider).map((msg) => ({
    name: msg.name,
    input: msg.internal,
    expected: msg[provider],
    skipRoundTrip: msg.skipRoundTrip,
  }));
}

export function getProviderToInternalTestCases(
  provider: "openai" | "anthropic" | "gemini"
): Array<{
  name: string;
  input: any;
  expected: InternalMessage[];
  skipRoundTrip?: boolean;
}> {
  return getTestMessagesForProvider(provider)
    .filter((msg) => !Array.isArray(msg[provider])) // Skip multi-message outputs
    .map((msg) => ({
      name: msg.name,
      input: msg[provider],
      expected: msg.internal,
      skipRoundTrip: msg.skipRoundTrip,
    }));
}

// Error test cases shared across providers
export interface ErrorTestCase {
  name: string;
  input: any;
  errorMessage: string | RegExp;
  providers?: string[]; // If specified, only test on these providers
}

export const sharedErrorTestCases: ErrorTestCase[] = [
  {
    name: "invalid role",
    input: { role: "invalid", content: "test" },
    errorMessage: /Invalid role/,
  },
  {
    name: "missing content",
    input: { role: "user" },
    errorMessage: /Content must be/,
  },
  {
    name: "invalid content type",
    input: { role: "user", content: 123 },
    errorMessage: /Content must be/,
  },
  {
    name: "null message",
    input: null,
    errorMessage: /Message must be/,
  },
  {
    name: "empty object",
    input: {},
    errorMessage: /Invalid role|Missing role/,
  },
];