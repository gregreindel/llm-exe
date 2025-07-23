import { describe, expect, it } from "@jest/globals";
import {
  anthropicMessageToInternal,
  internalMessagesToAnthropic,
  isAnthropicFormat,
} from "./anthropic";
import { AnthropicMessage } from "@/interfaces/anthropic";
import { InternalMessage } from "@/interfaces";
import {
  getProviderToInternalTestCases,
  getInternalToProviderTestCases,
  sharedErrorTestCases,
} from "../test-messages";

describe("Anthropic Message Converter", () => {
  // Get Anthropic-specific test cases from shared repository
  const toInternalTestCases = getProviderToInternalTestCases("anthropic");
  const fromInternalTestCases = getInternalToProviderTestCases("anthropic");

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
    // Test shared cases
    toInternalTestCases.forEach(({ name, input, expected }) => {
      it(`should convert ${name}`, () => {
        const result = anthropicMessageToInternal(input);
        expect(result).toHaveLength(expected.length);
        // Compare without metadata as it may differ
        result.forEach((msg, i) => {
          expect(msg.role).toEqual(expected[i].role);
          expect(msg.content).toEqual(expected[i].content);
          if (expected[i].name) expect(msg.name).toEqual(expected[i].name);
          if (expected[i].function_call)
            expect(msg.function_call).toEqual(expected[i].function_call);
          if (expected[i].tool_call_id)
            expect(msg.tool_call_id).toEqual(expected[i].tool_call_id);
        });
      });
    });

    // Test Anthropic-specific cases
    anthropicSpecificTestCases.forEach(({ name, input, expected }) => {
      it(`should convert ${name}`, () => {
        const result = anthropicMessageToInternal(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe("Internal to Anthropic conversion", () => {
    fromInternalTestCases.forEach(({ name, input, expected }) => {
      it(`should convert ${name}`, () => {
        // For system messages, test with strict: false
        const options = name.includes('system') ? { strict: false } : {};
        const result = internalMessagesToAnthropic(input, options);
        expect(result).toEqual(Array.isArray(expected) ? expected : [expected]);
      });
    });
  });

  describe("Bidirectional conversion (round-trip)", () => {
    [...toInternalTestCases, ...anthropicSpecificTestCases]
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
        name: "content not array",
        input: { role: "user", content: "string content" },
        errorMessage: "Anthropic messages must have content as an array",
      },
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
      const backToAnthropic = internalMessagesToAnthropic(internal);
      expect(backToAnthropic).toHaveLength(conversation.length);
    });
  });
});
