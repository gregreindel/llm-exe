import { describe, expect, it } from "@jest/globals";
import {
  openAIMessageToInternal,
  internalMessagesToOpenAI,
  isOpenAIFormat,
} from "./openai";
import { OpenAIMessage } from "@/interfaces/openai";
import { InternalMessage } from "@/interfaces";
import {
  getProviderToInternalTestCases,
  getInternalToProviderTestCases,
  sharedErrorTestCases,
} from "../test-messages";

describe("OpenAI Message Converter", () => {
  // Get OpenAI-specific test cases from shared repository
  const toInternalTestCases = getProviderToInternalTestCases("openai");
  const fromInternalTestCases = getInternalToProviderTestCases("openai");

  // Additional OpenAI-specific test cases not in shared
  const openAISpecificTestCases: {
    name: string;
    input: OpenAIMessage;
    expected: InternalMessage[];
    skipRoundTrip?: boolean;
  }[] = [

    // OpenAI-specific features that aren't covered in shared tests
    {
      name: "assistant message with tool_calls array (single tool)",
      input: {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "call_789",
            type: "function",
            function: {
              name: "get_weather",
              arguments: '{"location": "London"}',
            },
          },
        ],
      },
      expected: [
        {
          role: "assistant",
          content: [],
          function_call: {
            name: "get_weather",
            arguments: '{"location": "London"}',
          },
          _meta: {
            group: {
              id: expect.any(String),
              position: 0,
              total: 1,
            },
            original: {
              provider: "openai",
              tool_call_id: "call_789",
            },
          } as any,
        },
      ],
      skipRoundTrip: true,
    },
    {
      name: "function message (legacy) without tool_call_id",
      input: {
        role: "function",
        name: "get_weather",
        content: '{"temperature": 72, "condition": "sunny"}',
      },
      expected: [
        {
          role: "function",
          name: "get_weather",
          content: [
            {
              type: "text",
              text: '{"temperature": 72, "condition": "sunny"}',
            },
          ],
          _meta: { original: { provider: "openai" } },
        },
      ],
    },
    {
      name: "tool role message",
      input: {
        role: "tool",
        content: "72F and sunny",
        tool_call_id: "call_456",
      },
      expected: [
        {
          role: "function",
          name: "function",
          content: [{ type: "text", text: "72F and sunny" }],
          tool_call_id: "call_456",
          _meta: {
            original: { provider: "openai", tool_call_id: "call_456" },
          },
        },
      ],
    },
  ];

  describe("OpenAI to Internal conversion", () => {
    // Test shared cases
    toInternalTestCases.forEach(({ name, input, expected }) => {
      it(`should convert ${name}`, () => {
        const result = openAIMessageToInternal(input);
        expect(result).toHaveLength(expected.length);
        // Compare without metadata as it may differ
        result.forEach((msg, i) => {
          expect(msg.role).toEqual(expected[i].role);
          expect(msg.content).toEqual(expected[i].content);
          if (expected[i].name) expect(msg.name).toEqual(expected[i].name);
          if (expected[i].function_call) expect(msg.function_call).toEqual(expected[i].function_call);
          if (expected[i].tool_call_id) expect(msg.tool_call_id).toEqual(expected[i].tool_call_id);
        });
      });
    });

    // Test OpenAI-specific cases
    openAISpecificTestCases.forEach(({ name, input, expected }) => {
      it(`should convert ${name}`, () => {
        const result = openAIMessageToInternal(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe("Internal to OpenAI conversion", () => {
    fromInternalTestCases.forEach(({ name, input, expected }) => {
      it(`should convert ${name}`, () => {
        const result = internalMessagesToOpenAI(input);
        
        // Special handling for messages with function calls that get modernized
        if (name === "OpenAI legacy function_call") {
          expect(result).toHaveLength(1);
          expect(result[0].role).toBe("assistant");
          expect(result[0].content).toBe("Checking weather...");
          expect(result[0].tool_calls).toHaveLength(1);
          expect(result[0].tool_calls![0].type).toBe("function");
          expect(result[0].tool_calls![0].function.name).toBe("get_weather");
          expect(result[0].tool_calls![0].function.arguments).toBe('{"location": "London"}');
          expect(result[0].tool_calls![0].id).toMatch(/^call_/);
          return;
        }
        
        // Special handling for messages with generated IDs
        if (name.includes("function call") && !name.includes("legacy")) {
          const exp = Array.isArray(expected) ? expected : [expected];
          expect(result).toHaveLength(exp.length);
          result.forEach((msg, i) => {
            const expMsg = exp[i];
            expect(msg.role).toBe(expMsg.role);
            expect(msg.content).toEqual(expMsg.content);
            if (msg.tool_calls && expMsg.tool_calls) {
              expect(msg.tool_calls).toHaveLength(expMsg.tool_calls.length);
              msg.tool_calls.forEach((tc, j) => {
                expect(tc.type).toBe(expMsg.tool_calls[j].type);
                expect(tc.function).toEqual(expMsg.tool_calls[j].function);
                expect(tc.id).toMatch(/^call_/); // Generated ID
              });
            }
          });
          return;
        }
        
        expect(result).toEqual(Array.isArray(expected) ? expected : [expected]);
      });
    });
  });

  describe("Bidirectional conversion (round-trip)", () => {
    [...toInternalTestCases, ...openAISpecificTestCases]
      .filter((tc) => !tc.skipRoundTrip)
      .forEach(({ name, input }) => {
        it(`should round-trip ${name}`, () => {
          // Convert to internal
          const internal = openAIMessageToInternal(input);
          // Convert back to OpenAI
          const openAI = internalMessagesToOpenAI(internal);
          // Should match original (as array)
          expect(openAI).toEqual([input]);
        });
      });
  });

  describe("Format detection", () => {
    const detectionCases = [
      {
        name: "detects tool_calls",
        message: { role: "assistant", tool_calls: [] },
        expected: true,
      },
      {
        name: "detects tool role",
        message: { role: "tool", content: "result", tool_call_id: "123" },
        expected: true,
      },
      {
        name: "detects function_call",
        message: {
          role: "assistant",
          function_call: { name: "fn", arguments: "{}" },
        },
        expected: true,
      },
      {
        name: "detects tool_call_id",
        message: { role: "function", content: "result", tool_call_id: "123" },
        expected: true,
      },
      {
        name: "does not detect plain message",
        message: { role: "user", content: "Hello" },
        expected: false,
      },
    ];

    detectionCases.forEach(({ name, message, expected }) => {
      it(`${name}`, () => {
        expect(isOpenAIFormat(message)).toBe(expected);
      });
    });
  });

  describe("Error handling", () => {
    // Shared error cases
    sharedErrorTestCases
      .filter((tc) => !tc.providers || tc.providers.includes("openai"))
      .forEach(({ name, input, errorMessage }) => {
        it(`should throw error for ${name}`, () => {
          expect(() => openAIMessageToInternal(input as any)).toThrow(
            errorMessage
          );
        });
      });

    // OpenAI-specific error cases
    const openAIErrorCases = [
      {
        name: "invalid tool_calls type",
        input: { role: "assistant", content: null, tool_calls: "not-array" },
        errorMessage: "tool_calls must be an array",
      },
      {
        name: "invalid function_call",
        input: { role: "assistant", content: null, function_call: { name: "test" } },
        errorMessage: "function_call must have name and arguments",
      },
      {
        name: "tool role without tool_call_id",
        input: { role: "tool", content: "result" },
        errorMessage: "tool role requires tool_call_id",
      },
      {
        name: "function role without name",
        input: { role: "function", content: "result" },
        errorMessage: "function role requires name",
      },
    ];

    openAIErrorCases.forEach(({ name, input, errorMessage }) => {
      it(`should throw error for ${name}`, () => {
        expect(() => openAIMessageToInternal(input as any)).toThrow(
          errorMessage
        );
      });
    });

    it("should throw error for missing content type in array", () => {
      const input = {
        role: "user",
        content: [{ text: "hello" }] // missing type field
      };
      expect(() => openAIMessageToInternal(input as any)).toThrow(
        "Invalid content item at index 0: missing type"
      );
    });

    it("should throw error for invalid text content", () => {
      const input = {
        role: "user",
        content: [{ type: "text", text: 123 }] // text should be string
      };
      expect(() => openAIMessageToInternal(input as any)).toThrow(
        "Invalid text content at index 0"
      );
    });

    it("should throw error for invalid image_url content", () => {
      const input = {
        role: "user",
        content: [{ type: "image_url" }] // missing image_url field
      };
      expect(() => openAIMessageToInternal(input as any)).toThrow(
        "Invalid image_url content at index 0"
      );
    });

    it("should throw error for invalid tool call in array", () => {
      const input = {
        role: "assistant",
        content: null,
        tool_calls: [{ id: "123" }] // missing required fields
      };
      expect(() => openAIMessageToInternal(input as any)).toThrow(
        "Invalid tool call at index 0"
      );
    });

    it("should preserve tool_call_id when present in function message", () => {
      const input = {
        role: "function",
        name: "test_func",
        content: "Result",
        tool_call_id: "custom_id_123"
      };
      const result = openAIMessageToInternal(input);
      expect(result[0].tool_call_id).toBe("custom_id_123");
    });

    it("should throw error when messages is not an array for internalMessagesToOpenAI", () => {
      expect(() => internalMessagesToOpenAI("not an array" as any))
        .toThrow("Messages must be an array");
    });

    it("should validate internal message format", () => {
      const invalid = [{ not: "a valid message" }];
      expect(() => internalMessagesToOpenAI(invalid as any))
        .toThrow("Invalid internal message format");
    });

    it("should skip invalid messages in non-strict mode", () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const messages: any[] = [
        {
          role: "user",
          content: [{ type: "text", text: "Valid" }]
        },
        {
          // Invalid message that will throw
          role: "assistant",
          content: "test", // This should be wrapped, will cause validation to fail
          _meta: { invalid: true } // Force validation failure
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "Another valid" }]
        }
      ];
      
      const result = internalMessagesToOpenAI(messages, { strict: false });
      
      // Should skip the invalid message
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe("Valid");
      expect(result[1].content).toBe("Another valid");
      
      // Should have logged a warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Skipping invalid internal message at index 1:"),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe("Options handling", () => {
    it("should skip validation when validate is false", () => {
      const invalid = { role: "invalid", content: "test" };
      expect(() =>
        openAIMessageToInternal(invalid as any, { validate: false })
      ).not.toThrow();
    });

    it("should preserve unknown fields when preserveUnknown is true", () => {
      const input = {
        role: "user",
        content: "Hello",
        customField: "custom value",
        anotherField: 123,
      } as any;

      const result = openAIMessageToInternal(input, { preserveUnknown: true });
      expect(result[0]._meta?.original).toMatchObject({
        customField: "custom value",
        anotherField: 123,
      });
    });

    it("should use custom ID generator", () => {
      const customId = () => "custom-id-123";
      const input = {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "original",
            type: "function",
            function: { name: "test", arguments: "{}" },
          },
        ],
      };

      const result = openAIMessageToInternal(input as any, {
        generateId: customId,
      });
      expect(result[0]._meta?.group?.id).toBe("group_custom-id-123");
    });
  });

  describe("Content edge cases", () => {
    it("should convert unsupported content type to text", () => {
      const internal: InternalMessage[] = [
        {
          role: "user",
          content: [
            { type: "text", text: "Check this:" },
            { type: "audio" as any, data: "audio data" } as any
          ]
        }
      ];
      
      const result = internalMessagesToOpenAI(internal);
      expect(result[0].content).toEqual([
        { type: "text", text: "Check this:" },
        { type: "text", text: "[audio content]" }
      ]);
    });

    it("should handle unknown content type in OpenAI format", () => {
      const input = {
        role: "user",
        content: [
          { type: "unknown_type", data: "some data" }
        ]
      };
      
      const result = openAIMessageToInternal(input as any);
      expect(result[0].content).toEqual([
        { type: "text", text: "[Unknown content type: unknown_type]" }
      ]);
    });

    it("should handle malformed data URL for images", () => {
      const input = {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: "data:image/png;notbase64,baddata" }
          }
        ]
      };
      
      const result = openAIMessageToInternal(input);
      // Should fall back to regular URL handling
      expect(result[0].content[0]).toMatchObject({
        type: "image",
        mediaType: "image/jpeg",
        source: {
          type: "url",
          url: "data:image/png;notbase64,baddata"
        }
      });
    });

    it("should return empty array for non-array content", () => {
      const input = {
        role: "user",
        content: {} // Neither string, null, nor array
      };
      
      const result = openAIMessageToInternal(input as any, { validate: false });
      expect(result[0].content).toEqual([]);
    });
  });

  describe("Grouped message handling", () => {
    it("should handle grouped messages with only content", () => {
      const internal: InternalMessage[] = [
        {
          role: "assistant",
          content: [{ type: "text", text: "First part" }],
          _meta: {
            group: { id: "group_1", position: 0, total: 2 }
          }
        },
        {
          role: "assistant",
          content: [{ type: "text", text: "Second part" }],
          _meta: {
            group: { id: "group_1", position: 1, total: 2 }
          }
        }
      ];
      
      const result = internalMessagesToOpenAI(internal);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("assistant");
      expect(result[0].content).toBe("First part"); // Takes first content message
    });
  });

  describe("Complex message sequences", () => {
    it("should handle a complete conversation with mixed formats", () => {
      const conversation: OpenAIMessage[] = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What's the weather in NYC?" },
        {
          role: "assistant",
          content: "I'll check the weather for you.",
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
        { role: "tool", content: "72F and sunny", tool_call_id: "call_123" },
        {
          role: "assistant",
          content: "The weather in NYC is 72°F and sunny.",
        },
        { role: "user", content: "Thanks! How about Tokyo?" },
        {
          role: "assistant",
          content: null,
          function_call: {
            name: "get_weather",
            arguments: '{"location": "Tokyo"}',
          },
        },
        {
          role: "function",
          name: "get_weather",
          content: '{"temp": 68, "condition": "cloudy"}',
        },
        { role: "assistant", content: "Tokyo is 68°F and cloudy." },
      ];

      // Convert all messages
      const internal = conversation.flatMap((msg) =>
        openAIMessageToInternal(msg)
      );

      // Verify we get the expected number of internal messages
      // (tool_calls message expands to 2)
      expect(internal).toHaveLength(10);

      // Verify roles are preserved correctly
      expect(internal.map((m) => m.role)).toEqual([
        "system",
        "user",
        "assistant", // content part
        "assistant", // tool call part
        "function",
        "assistant",
        "user",
        "assistant",
        "function",
        "assistant",
      ]);

      // Convert back and verify structure is maintained
      const backToOpenAI = internalMessagesToOpenAI(internal);
      expect(backToOpenAI).toHaveLength(conversation.length);
    });
  });
});