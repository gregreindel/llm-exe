import { describe, expect, it } from "@jest/globals";
import {
  anthropicMessageToInternal,
  internalMessagesToAnthropic,
  isAnthropicFormat,
} from "./anthropic";
import type { AnthropicToolUseContent, AnthropicContent } from "./anthropic";
import { AnthropicMessage } from "@/interfaces/anthropic";
import { InternalMessage } from "@/interfaces";
import {
  sharedErrorTestCases,
} from "../test-messages";

describe("Anthropic Message Converter", () => {

  // Additional Anthropic-specific test cases not in shared
  const anthropicSpecificTestCases: {
    name: string;
    input: AnthropicMessage;
    expected: InternalMessage[];
    skipRoundTrip?: boolean;
  }[] = [
    // Anthropic-specific tool use with error
    {
      name: "tool_result with error flag",
      input: {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "toolu_123",
            content: "Error: API rate limit exceeded",
            is_error: true,
          },
        ],
      },
      expected: [
        {
          role: "function",
          name: "function",
          content: [{ type: "text", text: "Error: API rate limit exceeded" }],
          tool_call_id: "toolu_123",
          _meta: {
            original: {
              provider: "anthropic",
              tool_call_id: "toolu_123",
              contentType: "tool_result",
              is_error: true,
            },
          },
        },
      ],
    },
    // Multiple tool uses in single message
    {
      name: "assistant with multiple tool_use blocks",
      input: {
        role: "assistant",
        content: [
          { type: "text", text: "I'll help you with both tasks." },
          {
            type: "tool_use",
            id: "toolu_1",
            name: "search",
            input: { query: "weather in NYC" },
          },
          {
            type: "tool_use",
            id: "toulu_2",
            name: "calculate",
            input: { expression: "2 + 2" },
          },
        ],
      },
      expected: [
        {
          role: "assistant",
          content: [{ type: "text", text: "I'll help you with both tasks." }],
          _meta: {
            group: {
              id: expect.any(String),
              position: 0,
              total: 3,
            },
            original: { provider: "anthropic" },
          },
        } as any,
        {
          role: "assistant",
          content: [],
          function_call: {
            name: "search",
            arguments: '{"query":"weather in NYC"}',
          },
          _meta: {
            group: {
              id: expect.any(String),
              position: 1,
              total: 3,
            },
            original: {
              provider: "anthropic",
              tool_use_id: "toolu_1",
            },
          },
        } as any,
        {
          role: "assistant",
          content: [],
          function_call: {
            name: "calculate",
            arguments: '{"expression":"2 + 2"}',
          },
          _meta: {
            group: {
              id: expect.any(String),
              position: 2,
              total: 3,
            },
            original: {
              provider: "anthropic",
              tool_use_id: "toulu_2",
            },
          },
        } as any,
      ],
      skipRoundTrip: true,
    },
  ];

  describe("Anthropic to Internal conversion", () => {
    it("should convert simple text message", () => {
      const input = {
        role: "user",
        content: "Hello, world!"
      };
      const result = anthropicMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        role: "user",
        content: [{ type: "text", text: "Hello, world!" }],
        _meta: { original: { provider: "anthropic" } }
      });
    });

    it("should convert array content with text", () => {
      const input = {
        role: "assistant",
        content: [
          { type: "text", text: "Hello" },
          { type: "text", text: "World" }
        ]
      };
      const result = anthropicMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("assistant");
      expect(result[0].content).toEqual([
        { type: "text", text: "Hello" },
        { type: "text", text: "World" }
      ]);
    });

    it("should convert tool_use content", () => {
      const input = {
        role: "assistant",
        content: [
          { type: "text", text: "Let me check that" },
          {
            type: "tool_use",
            id: "toolu_123",
            name: "get_weather",
            input: { location: "NYC" }
          }
        ]
      };
      const result = anthropicMessageToInternal(input);
      expect(result).toHaveLength(2);
      
      // Sort by group position to get the right order
      result.sort((a, b) => (a._meta?.group?.position || 0) - (b._meta?.group?.position || 0));
      
      // First message has function call
      expect(result[0].function_call).toEqual({
        name: "get_weather",
        arguments: JSON.stringify({ location: "NYC" })
      });
      // Second message has text content
      expect(result[1].content).toEqual([{ type: "text", text: "Let me check that" }]);
    });

    it("should convert tool_result content", () => {
      const input = {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "toolu_123",
            content: "72F and sunny"
          }
        ]
      };
      const result = anthropicMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("function");
      expect(result[0].tool_call_id).toBe("toolu_123");
      expect(result[0].content).toEqual([{ type: "text", text: "72F and sunny" }]);
    });

    it("should convert image content with base64", () => {
      const input = {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
            }
          }
        ]
      };
      const result = anthropicMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].content[0]).toEqual({
        type: "image",
        mediaType: "image/png",
        source: {
          type: "base64",
          data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        }
      });
    });

    it("should convert image content with URL", () => {
      const input = {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "url",
              media_type: "image/jpeg",
              url: "https://example.com/image.jpg"
            }
          }
        ]
      };
      const result = anthropicMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].content[0]).toEqual({
        type: "image",
        mediaType: "image/jpeg",
        source: {
          type: "url",
          url: "https://example.com/image.jpg"
        }
      });
    });

    it("should convert messages with mixed content types", () => {
      const input = {
        role: "assistant",
        content: [
          { type: "text", text: "Here's the weather and calculation:" },
          {
            type: "tool_use",
            id: "toolu_weather",
            name: "get_weather",
            input: { location: "NYC" }
          },
          {
            type: "tool_use",
            id: "toolu_calc",
            name: "calculate",
            input: { expression: "2 + 2" }
          }
        ]
      };
      const result = anthropicMessageToInternal(input);
      // Should create separate messages for text and each tool use
      expect(result.length).toBeGreaterThanOrEqual(2);
      
      // Find the text message
      const textMsg = result.find(m => m.content.length > 0 && m.content[0].type === "text");
      expect(textMsg).toBeDefined();
      expect(textMsg!.content[0]).toEqual({
        type: "text",
        text: "Here's the weather and calculation:"
      });
      
      // Find function calls
      const functionMsgs = result.filter(m => m.function_call);
      expect(functionMsgs).toHaveLength(2);
      expect(functionMsgs[0].function_call).toEqual({
        name: "get_weather",
        arguments: '{"location":"NYC"}'
      });
      expect(functionMsgs[1].function_call).toEqual({
        name: "calculate",
        arguments: '{"expression":"2 + 2"}'
      });
    });

    // Test Anthropic-specific cases
    anthropicSpecificTestCases
      .filter(tc => tc.name !== "assistant with multiple tool_use blocks") // Handle separately
      .forEach(({ name, input, expected }) => {
        it(`should convert ${name}`, () => {
          const result = anthropicMessageToInternal(input);
          expect(result).toEqual(expected);
        });
      });
    
    it("should convert assistant with multiple tool_use blocks", () => {
      const input = {
        role: "assistant",
        content: [
          { type: "text", text: "I'll help you with both tasks." },
          {
            type: "tool_use",
            id: "toolu_1",
            name: "search",
            input: { query: "weather in NYC" },
          },
          {
            type: "tool_use",
            id: "toolu_2",
            name: "calculate",
            input: { expression: "2 + 2" },
          },
        ],
      };
      
      const result = anthropicMessageToInternal(input);
      
      // Should create 3 messages: one for text, two for tool uses
      expect(result).toHaveLength(3);
      
      // Check they all have the same group
      const groupId = result[0]._meta?.group?.id;
      expect(groupId).toBeDefined();
      expect(result.every(m => m._meta?.group?.id === groupId)).toBe(true);
      
      // Find and check each message type
      const textMsg = result.find(m => m.content.length > 0 && m.content[0].type === "text");
      expect(textMsg?.content[0]).toEqual({ type: "text", text: "I'll help you with both tasks." });
      
      const toolMsgs = result.filter(m => m.function_call);
      expect(toolMsgs).toHaveLength(2);
      expect(toolMsgs[0].function_call).toEqual({
        name: "search",
        arguments: '{"query":"weather in NYC"}'
      });
      expect(toolMsgs[1].function_call).toEqual({
        name: "calculate",
        arguments: '{"expression":"2 + 2"}'
      });
    });
  });

  describe("Internal to Anthropic conversion", () => {
    it("should convert simple text message", () => {
      const input: InternalMessage[] = [{
        role: "user",
        content: [{ type: "text" as const, text: "Hello, world!" }]
      }];
      const result = internalMessagesToAnthropic(input);
      expect(result).toEqual([{
        role: "user",
        content: [{ type: "text", text: "Hello, world!" }]
      }]);
    });

    it("should convert function call to tool_use", () => {
      const input = [{
        role: "assistant",
        content: [],
        function_call: {
          name: "get_weather",
          arguments: '{"location": "NYC"}'
        }
      }];
      const result = internalMessagesToAnthropic(input);
      expect(result).toEqual([{
        role: "assistant",
        content: [{
          type: "tool_use",
          id: expect.stringMatching(/^toolu_/),
          name: "get_weather",
          input: { location: "NYC" }
        }]
      }]);
    });

    it("should convert function response to tool_result", () => {
      const input: InternalMessage[] = [{
        role: "function",
        name: "function",
        content: [{ type: "text" as const, text: "72F and sunny" }],
        tool_call_id: "call_123"
      }];
      const result = internalMessagesToAnthropic(input);
      expect(result).toEqual([{
        role: "user",
        content: [{
          type: "tool_result",
          tool_use_id: "call_123",
          content: "72F and sunny"
        }]
      }]);
    });

    it("should convert assistant with text and function call", () => {
      const input: InternalMessage[] = [
        {
          role: "assistant",
          content: [{ type: "text" as const, text: "Let me check that" }],
          _meta: {
            group: { id: "group_123", position: 0, total: 2 },
            original: { provider: "anthropic" }
          }
        },
        {
          role: "assistant",
          content: [],
          function_call: {
            name: "get_weather",
            arguments: '{"location": "Paris"}'
          },
          _meta: {
            group: { id: "group_123", position: 1, total: 2 },
            original: { provider: "anthropic" }
          }
        }
      ];
      const result = internalMessagesToAnthropic(input);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("assistant");
      expect(result[0].content).toHaveLength(2);
      expect(result[0].content[0]).toEqual({ type: "text", text: "Let me check that" });
      // Check tool_use content separately to handle generated ID
      const content = result[0].content as AnthropicContent[];
      const toolUse = content[1] as AnthropicToolUseContent;
      expect(toolUse.type).toBe("tool_use");
      expect(toolUse.id).toMatch(/^toolu_/);
      expect(toolUse.name).toBe("get_weather");
      expect(toolUse.input).toEqual({ location: "Paris" });
    });

    it("should convert multiple function calls", () => {
      const input = [
        {
          role: "assistant",
          content: [],
          function_call: {
            name: "get_weather",
            arguments: '{"location": "Tokyo"}'
          },
          _meta: {
            group: { id: "group_789", position: 0, total: 2 }
          }
        },
        {
          role: "assistant",
          content: [],
          function_call: {
            name: "get_time",
            arguments: '{"timezone": "JST"}'
          },
          _meta: {
            group: { id: "group_789", position: 1, total: 2 }
          }
        }
      ];
      const result = internalMessagesToAnthropic(input);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("assistant");
      expect(result[0].content).toHaveLength(2);
      
      // Check first tool_use
      const content = result[0].content as AnthropicContent[];
      const firstTool = content[0] as AnthropicToolUseContent;
      expect(firstTool.type).toBe("tool_use");
      expect(firstTool.id).toMatch(/^toolu_/);
      expect(firstTool.name).toBe("get_weather");
      expect(firstTool.input).toEqual({ location: "Tokyo" });
      
      // Check second tool_use
      const secondTool = content[1] as AnthropicToolUseContent;
      expect(secondTool.type).toBe("tool_use");
      expect(secondTool.id).toMatch(/^toolu_/);
      expect(secondTool.name).toBe("get_time");
      expect(secondTool.input).toEqual({ timezone: "JST" });
    });

    it("should handle system messages with strict: false", () => {
      const input: InternalMessage[] = [{
        role: "system",
        content: [{ type: "text" as const, text: "You are helpful" }]
      }];
      const result = internalMessagesToAnthropic(input, { strict: false });
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("system");
      // System messages can be either string or array format per Anthropic docs
      // Our converter uses string for single text content, which is valid
      expect(result[0].content).toBe("You are helpful");
    });

    it("should throw on system messages with strict: true", () => {
      const input: InternalMessage[] = [{
        role: "system",
        content: [{ type: "text" as const, text: "You are helpful" }]
      }];
      expect(() => internalMessagesToAnthropic(input)).toThrow(/system role/);
    });
  });

  describe("Bidirectional conversion (round-trip)", () => {
    anthropicSpecificTestCases
      .filter((tc) => !tc.skipRoundTrip)
      .forEach(({ name, input }) => {
        it(`should round-trip ${name}`, () => {
          // Convert to internal
          const internal = anthropicMessageToInternal(input);
          // Convert back to Anthropic
          const options = name.includes('system') ? { strict: false } : {};
          const anthropic = internalMessagesToAnthropic(internal, options);
          // Should match original (as array)
          expect(anthropic).toEqual([input]);
        });
      });
  });

  describe("Format detection", () => {
    const detectionCases = [
      {
        name: "detects content array with text",
        message: {
          role: "user",
          content: [{ type: "text", text: "Hello" }],
        },
        expected: true,
      },
      {
        name: "detects tool_use content",
        message: {
          role: "assistant",
          content: [
            {
              type: "tool_use",
              id: "toolu_123",
              name: "test",
              input: {},
            },
          ],
        },
        expected: true,
      },
      {
        name: "detects tool_result content",
        message: {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: "toolu_123",
              content: "result",
            },
          ],
        },
        expected: true,
      },
      {
        name: "does not detect string content",
        message: { role: "user", content: "Hello" },
        expected: false,
      },
      {
        name: "does not detect empty object",
        message: {},
        expected: false,
      },
      {
        name: "does not detect null (line 627)",
        message: null,
        expected: false,
      },
      {
        name: "does not detect primitive string (line 627)",
        message: "not an object",
        expected: false,
      },
      {
        name: "does not detect when content is not array (line 632)",
        message: { role: "user", content: "string content" },
        expected: false,
      },
      {
        name: "does not detect when content array has no anthropic types (line 632)",
        message: { 
          role: "user", 
          content: [
            { type: "unknown", data: "test" },
            { type: "custom", value: "data" }
          ] 
        },
        expected: false,
      },
    ];

    detectionCases.forEach(({ name, message, expected }) => {
      it(`${name}`, () => {
        expect(isAnthropicFormat(message)).toBe(expected);
      });
    });
  });

  describe("Error handling", () => {
    // Shared error cases
    sharedErrorTestCases
      .filter((tc) => !tc.providers || tc.providers.includes("anthropic"))
      .forEach(({ name, input, errorMessage }) => {
        it(`should throw error for ${name}`, () => {
          expect(() => anthropicMessageToInternal(input as any)).toThrow(
            errorMessage
          );
        });
      });

    // Anthropic-specific error cases
    const anthropicErrorCases = [
      {
        name: "invalid content item",
        input: { role: "user", content: [{ invalid: "item" }] },
        errorMessage: "Invalid content item",
      },
      {
        name: "tool_use without required fields",
        input: {
          role: "assistant",
          content: [{ type: "tool_use", name: "test" }],
        },
        errorMessage: "tool_use content must have id, name, and input",
      },
      {
        name: "tool_result without tool_use_id",
        input: {
          role: "user",
          content: [{ type: "tool_result", content: "result" }],
        },
        errorMessage: "tool_result must have tool_use_id",
      },
    ];

    anthropicErrorCases.forEach(({ name, input, errorMessage }) => {
      it(`should throw error for ${name}`, () => {
        expect(() => anthropicMessageToInternal(input as any)).toThrow(
          errorMessage
        );
      });
    });
  });

  describe("Options handling", () => {
    it("should skip validation when validate is false", () => {
      const invalid = {
        role: "invalid",
        content: [{ type: "text", text: "test" }],
      };
      expect(() =>
        anthropicMessageToInternal(invalid as any, { validate: false })
      ).not.toThrow();
    });

    it("should use custom generateId function when provided", () => {
      let counter = 0;
      const customIdGen = () => `custom_${counter++}`;
      
      const input = {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "toolu_123",
            name: "test_func",
            input: { test: true }
          }
        ]
      };
      
      const result = anthropicMessageToInternal(input, { generateId: customIdGen });
      
      // Check that the group ID uses our custom generator
      const groupId = result[0]._meta?.group?.id;
      expect(groupId).toMatch(/^group_custom_\d+$/);
    });

    it("should preserve unknown fields when preserveUnknown is true", () => {
      const input = {
        role: "user",
        content: [{ type: "text", text: "Hello" }],
        customField: "custom value",
        metadata: { key: "value" },
      } as any;

      const result = anthropicMessageToInternal(input, {
        preserveUnknown: true,
      });
      expect(result[0]._meta?.original).toMatchObject({
        customField: "custom value",
        metadata: { key: "value" },
      });
    });

    it("should throw error for system messages with strict mode (default)", () => {
      const internal: InternalMessage[] = [
        {
          role: "system",
          content: [{ type: "text" as const, text: "You are helpful" }],
        },
      ];
      
      expect(() => internalMessagesToAnthropic(internal)).toThrow(
        "Anthropic does not support system role"
      );
    });

    it("should allow system messages with strict: false", () => {
      const internal: InternalMessage[] = [
        {
          role: "system",
          content: [{ type: "text" as const, text: "You are helpful" }],
        },
      ];
      
      const result = internalMessagesToAnthropic(internal, { strict: false });
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("system");
    });
  });

  describe("Complex message sequences", () => {
    it("should handle a conversation with mixed content types", () => {
      const conversation: AnthropicMessage[] = [
        {
          role: "system",
          content: [{ type: "text", text: "You are a helpful assistant." }],
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Can you analyze this image?" },
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
        {
          role: "assistant",
          content: [
            { type: "text", text: "I'll analyze this image for you." },
            {
              type: "tool_use",
              id: "toolu_123",
              name: "image_analysis",
              input: { mode: "detailed" },
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: "toolu_123",
              content: "The image appears to be a single red pixel.",
            },
          ],
        },
        {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "The image you provided is a 1x1 pixel red image.",
            },
          ],
        },
      ];

      // Convert all messages
      const internal = conversation.flatMap((msg) =>
        anthropicMessageToInternal(msg)
      );

      // Verify we get the expected number of internal messages
      // (assistant message with tool_use expands to 2)
      expect(internal).toHaveLength(6);

      // Verify roles are preserved correctly
      expect(internal.map((m) => m.role)).toEqual([
        "system",
        "user",
        "assistant", // text part
        "assistant", // tool_use part
        "function",
        "assistant",
      ]);

      // Convert back and verify structure is maintained
      // Need strict: false because of system message
      const backToAnthropic = internalMessagesToAnthropic(internal, { strict: false });
      expect(backToAnthropic).toHaveLength(conversation.length);
    });
  });

  describe("Additional validation error cases", () => {
    it("should throw error for tool_use without id", () => {
      const input = {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            name: "test_func",
            input: { test: true }
          }
        ]
      };
      expect(() => anthropicMessageToInternal(input as any)).toThrow(
        "tool_use content must have id, name, and input"
      );
    });

    it("should throw error for tool_use without name", () => {
      const input = {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "toolu_123",
            input: { test: true }
          }
        ]
      };
      expect(() => anthropicMessageToInternal(input as any)).toThrow(
        "tool_use content must have id, name, and input"
      );
    });

    it("should throw error for tool_use without input", () => {
      const input = {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "toolu_123",
            name: "test_func"
          }
        ]
      };
      expect(() => anthropicMessageToInternal(input as any)).toThrow(
        "tool_use content must have id, name, and input"
      );
    });

    it("should throw error for non-serializable tool input", () => {
      const circularRef: any = { a: 1 };
      circularRef.self = circularRef;
      
      const input = {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "toolu_123",
            name: "test_func",
            input: circularRef
          }
        ]
      };
      expect(() => anthropicMessageToInternal(input as any)).toThrow(
        "Invalid tool input at index 0: not serializable"
      );
    });

    it("should throw error for tool_result without content string", () => {
      const input = {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "toolu_123",
            content: 123 // Should be string
          }
        ]
      };
      expect(() => anthropicMessageToInternal(input as any)).toThrow(
        "tool_result must have content as string"
      );
    });

    it("should throw error for unknown content type", () => {
      const input = {
        role: "user",
        content: [
          {
            type: "unknown_type",
            data: "test"
          }
        ]
      };
      expect(() => anthropicMessageToInternal(input as any)).toThrow(
        "Invalid content type at index 0: unknown_type"
      );
    });

    it("should throw error for user messages with tool_use", () => {
      const input = {
        role: "user",
        content: [
          {
            type: "tool_use",
            id: "toolu_123",
            name: "test_func",
            input: {}
          }
        ]
      };
      expect(() => anthropicMessageToInternal(input as any)).toThrow(
        "User messages cannot contain tool_use"
      );
    });
  });

  describe("Edge cases and special handling", () => {
    it("should handle empty content array", () => {
      const input = {
        role: "assistant",
        content: []
      };
      const result = anthropicMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        role: "assistant",
        content: [],
        _meta: {
          original: {
            provider: "anthropic",
            wasArray: true,
            hadEmptyParts: true
          }
        }
      });
    });

    it("should preserve unknown fields in empty content array with preserveUnknown", () => {
      const input = {
        role: "assistant",
        content: [],
        customField: "test",
        metadata: { foo: "bar" }
      } as any;
      
      const result = anthropicMessageToInternal(input, { preserveUnknown: true });
      expect(result[0]._meta?.original).toMatchObject({
        provider: "anthropic",
        wasArray: true,
        hadEmptyParts: true,
        customField: "test",
        metadata: { foo: "bar" }
      });
    });

    it("should preserve unknown fields for string content with preserveUnknown", () => {
      const input = {
        role: "user",
        content: "Hello",
        customField: "value",
        timestamp: 123456
      } as any;
      
      const result = anthropicMessageToInternal(input, { preserveUnknown: true });
      expect(result[0]._meta?.original).toMatchObject({
        provider: "anthropic",
        customField: "value",
        timestamp: 123456
      });
    });

    it("should handle assistant message with content and function_call", () => {
      const internal: InternalMessage[] = [
        {
          role: "assistant",
          content: [{ type: "text", text: "Let me help" }],
          function_call: {
            name: "search",
            arguments: '{"query": "test"}'
          },
          _meta: {
            original: {
              tool_call_id: "existing_id"
            }
          }
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result).toHaveLength(1);
      expect(result[0].content).toHaveLength(2);
      expect(result[0].content[0]).toEqual({ type: "text", text: "Let me help" });
      expect(result[0].content[1]).toMatchObject({
        type: "tool_use",
        id: "existing_id",
        name: "search",
        input: { query: "test" }
      });
    });

    it("should log warning for conversion errors in non-strict mode", () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Create an internal message that will throw during conversion
      const internal: InternalMessage[] = [
        {
          role: "user",
          content: [{ type: "text", text: "Valid message" }]
        },
        {
          // This will cause an error during conversion because content is not an array
          role: "assistant",
          content: null as any
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "Another valid message" }]
        }
      ];
      
      const result = internalMessagesToAnthropic(internal, { strict: false });
      
      // Should skip the invalid message and convert the rest
      expect(result).toHaveLength(2);
      expect(result[0].content).toEqual([{ type: "text", text: "Valid message" }]);
      expect(result[1].content).toEqual([{ type: "text", text: "Another valid message" }]);
      
      // Should have logged a warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Skipping invalid internal message at index 1:"),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe("Content conversion edge cases", () => {
    it("should throw error when messages is not an array", () => {
      expect(() => internalMessagesToAnthropic("not an array" as any)).toThrow(
        "Messages must be an array"
      );
    });
    it("should convert unsupported content types to text", () => {
      // This tests the fallback in contentPartsToAnthropic
      const internal: InternalMessage[] = [
        {
          role: "user",
          content: [
            { type: "text", text: "Hello" },
            { type: "unsupported_type" as any, data: "test" } as any
          ]
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result[0].content).toEqual([
        { type: "text", text: "Hello" },
        { type: "text", text: "[unsupported_type content]" }
      ]);
    });

    it("should handle image with missing data in base64 source", () => {
      const input = {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: "" // Empty data instead of missing
            }
          }
        ]
      };
      
      const result = anthropicMessageToInternal(input);
      expect(result[0].content[0]).toMatchObject({
        type: "image",
        mediaType: "image/png",
        source: {
          type: "base64",
          data: ""
        }
      });
    });

    it("should handle consecutive function messages", () => {
      const internal: InternalMessage[] = [
        {
          role: "function",
          name: "func1",
          content: [{ type: "text", text: "Result 1" }],
          tool_call_id: "call_1"
        },
        {
          role: "function",
          name: "func2",
          content: [{ type: "text", text: "Result 2" }],
          tool_call_id: "call_2",
          _meta: {
            original: {
              is_error: true
            }
          }
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "Done" }]
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result).toHaveLength(2);
      
      // First message should combine both function results
      expect(result[0].role).toBe("user");
      expect(result[0].content).toHaveLength(2);
      expect(result[0].content[0]).toEqual({
        type: "tool_result",
        tool_use_id: "call_1",
        content: "Result 1"
      });
      expect(result[0].content[1]).toEqual({
        type: "tool_result",
        tool_use_id: "call_2",
        content: "Result 2",
        is_error: true
      });
      
      // Second message is the assistant response
      expect(result[1].role).toBe("assistant");
    });

    it("should use generateId for missing tool_call_ids", () => {
      let counter = 0;
      const customIdGen = () => `custom_${counter++}`;
      
      const internal: InternalMessage[] = [
        {
          role: "function",
          name: "test",
          content: [{ type: "text", text: "Result" }]
          // No tool_call_id
        }
      ];
      
      const result = internalMessagesToAnthropic(internal, { generateId: customIdGen });
      expect(result[0].content[0]).toMatchObject({
        type: "tool_result",
        tool_use_id: "tool_custom_0",
        content: "Result"
      });
    });
  });

  describe("Content format conversion logic", () => {
    it("should convert single text content to string for non-user/assistant roles", () => {
      const internal: InternalMessage[] = [
        {
          role: "system",
          content: [{ type: "text", text: "System prompt" }]
        }
      ];
      
      const result = internalMessagesToAnthropic(internal, { strict: false });
      expect(result[0].content).toBe("System prompt");
    });

    it("should convert multiple text parts to array", () => {
      const internal: InternalMessage[] = [
        {
          role: "user",
          content: [
            { type: "text", text: "Part 1" },
            { type: "text", text: "Part 2" }
          ]
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result[0].content).toEqual([
        { type: "text", text: "Part 1" },
        { type: "text", text: "Part 2" }
      ]);
    });

    it("should convert empty content to empty array", () => {
      const internal: InternalMessage[] = [
        {
          role: "user",
          content: []
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result[0].content).toEqual([]);
    });

    it("should convert content to array when original was array", () => {
      const internal: InternalMessage[] = [
        {
          role: "user",
          content: [{ type: "text", text: "Hello" }],
          _meta: {
            original: {
              wasArray: true
            }
          }
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result[0].content).toEqual([
        { type: "text", text: "Hello" }
      ]);
    });

    it("should convert internal image with url source", () => {
      const internal: InternalMessage[] = [
        {
          role: "user",
          content: [
            {
              type: "image",
              mediaType: "image/jpeg",
              source: {
                type: "url",
                url: "https://example.com/image.jpg"
              }
            }
          ]
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result[0].content).toEqual([
        {
          type: "image",
          source: {
            type: "url",
            media_type: "image/jpeg",
            url: "https://example.com/image.jpg"
          }
        }
      ]);
    });

    it("should handle missing url in image source", () => {
      const internal: InternalMessage[] = [
        {
          role: "user",
          content: [
            {
              type: "image",
              mediaType: "image/jpeg",
              source: {
                type: "url",
                url: undefined as any
              }
            }
          ]
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result[0].content).toEqual([
        {
          type: "image",
          source: {
            type: "url",
            media_type: "image/jpeg",
            url: ""
          }
        }
      ]);
    });

    it("should handle missing data in base64 image source (line 456)", () => {
      const internal: InternalMessage[] = [
        {
          role: "user",
          content: [
            {
              type: "image",
              mediaType: "image/png",
              source: {
                type: "base64",
                data: undefined as any // Missing data should fallback to ""
              }
            }
          ]
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result[0].content).toEqual([
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: ""
          }
        }
      ]);
    });

    it("should handle group sorting when positions are equal (line 506)", () => {
      // Create grouped messages with missing/undefined positions to test sorting
      const internal: InternalMessage[] = [
        {
          role: "assistant",
          content: [{ type: "text", text: "Second part" }],
          _meta: {
            group: { id: "group_test", position: undefined as any, total: 2 }
          }
        },
        {
          role: "assistant",
          content: [],
          function_call: { name: "test", arguments: "{}" },
          _meta: {
            group: { id: "group_test", position: 0, total: 2 }
          }
        }
      ];
      
      const result = internalMessagesToAnthropic(internal);
      expect(result).toHaveLength(1);
      // Should handle the sorting gracefully and produce valid output
      expect(result[0].role).toBe("assistant");
      expect(Array.isArray(result[0].content)).toBe(true);
    });
  });
});
