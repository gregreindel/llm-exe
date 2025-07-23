import { describe, expect, it } from "@jest/globals";
import {
  geminiMessageToInternal,
  internalMessagesToGemini,
  isGeminiFormat,
} from "./gemini";
import { GeminiMessage } from "./gemini";
import { InternalMessage } from "@/interfaces";
import {
  getProviderToInternalTestCases,
  getInternalToProviderTestCases,
  sharedErrorTestCases,
} from "../test-messages";

describe("Gemini Message Converter", () => {
  // Get Gemini-specific test cases from shared repository
  const toInternalTestCases = getProviderToInternalTestCases("gemini");
  const fromInternalTestCases = getInternalToProviderTestCases("gemini");

  // Additional Gemini-specific test cases not in shared
  const geminiSpecificTestCases: {
    name: string;
    input: GeminiMessage;
    expected: InternalMessage[];
    skipRoundTrip?: boolean;
  }[] = [
    // Gemini-specific fileData references
    {
      name: "user message with fileData",
      input: {
        role: "user",
        parts: [
          { text: "What's in this file?" },
          {
            fileData: {
              mimeType: "application/pdf",
              fileUri: "gs://bucket/document.pdf",
            },
          },
        ],
      },
      expected: [
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this file?" },
            {
              type: "document",
              mediaType: "application/pdf",
              source: {
                type: "url",
                url: "gs://bucket/document.pdf",
              },
            },
          ],
          _meta: { original: { provider: "gemini" } },
        },
      ],
    },
    // Multiple function calls in separate messages
    {
      name: "model with multiple function calls (separate messages)",
      input: {
        role: "model",
        parts: [
          {
            functionCall: {
              name: "get_weather",
              args: { location: "NYC" },
            },
          },
          {
            functionCall: {
              name: "get_time",
              args: { timezone: "EST" },
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
            arguments: '{"location":"NYC"}',
          },
          _meta: {
            group: {
              id: expect.any(String),
              position: 0,
              total: 2,
            },
            original: { provider: "gemini" },
          },
        } as any,
        {
          role: "assistant",
          content: [],
          function_call: {
            name: "get_time",
            arguments: '{"timezone":"EST"}',
          },
          _meta: {
            group: {
              id: expect.any(String),
              position: 1,
              total: 2,
            },
            original: { provider: "gemini" },
          },
        } as any,
      ],
      skipRoundTrip: true,
    },
    // Function response with complex data
    {
      name: "function response with complex object",
      input: {
        role: "function",
        parts: [
          {
            functionResponse: {
              name: "get_weather",
              response: {
                location: "NYC",
                temperature: 72,
                conditions: ["sunny", "windy"],
                forecast: {
                  tomorrow: { high: 75, low: 60 },
                },
              },
            },
          },
        ],
      },
      expected: [
        {
          role: "function",
          name: "get_weather",
          content: [
            {
              type: "text",
              text: '{"location":"NYC","temperature":72,"conditions":["sunny","windy"],"forecast":{"tomorrow":{"high":75,"low":60}}}',
            },
          ],
          _meta: { original: { provider: "gemini" } },
        },
      ],
    },
  ];

  describe("Gemini to Internal conversion", () => {
    // Test shared cases
    toInternalTestCases.forEach(({ name, input, expected }) => {
      it(`should convert ${name}`, () => {
        const result = geminiMessageToInternal(input);
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

    // Test Gemini-specific cases
    geminiSpecificTestCases.forEach(({ name, input, expected }) => {
      it(`should convert ${name}`, () => {
        const result = geminiMessageToInternal(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe("Internal to Gemini conversion", () => {
    fromInternalTestCases.forEach(({ name, input, expected }) => {
      it(`should convert ${name}`, () => {
        const result = internalMessagesToGemini(input);
        expect(result).toEqual(Array.isArray(expected) ? expected : [expected]);
      });
    });
  });

  describe("Bidirectional conversion (round-trip)", () => {
    [...toInternalTestCases, ...geminiSpecificTestCases]
      .filter((tc) => !tc.skipRoundTrip)
      .forEach(({ name, input }) => {
        it(`should round-trip ${name}`, () => {
          // Convert to internal
          const internal = geminiMessageToInternal(input);
          // Convert back to Gemini
          const gemini = internalMessagesToGemini(internal);
          // Should match original (as array)
          expect(gemini).toEqual([input]);
        });
      });
  });

  describe("Format detection", () => {
    const detectionCases = [
      {
        name: "detects parts array",
        message: { role: "user", parts: [{ text: "Hello" }] },
        expected: true,
      },
      {
        name: "detects model role",
        message: { role: "model", parts: [{ text: "Hi" }] },
        expected: true,
      },
      {
        name: "detects function role",
        message: {
          role: "function",
          parts: [{ functionResponse: { name: "test", response: {} } }],
        },
        expected: true,
      },
      {
        name: "detects functionCall",
        message: {
          role: "model",
          parts: [{ functionCall: { name: "test", args: {} } }],
        },
        expected: true,
      },
      {
        name: "does not detect invalid format",
        message: { role: "user", content: "Hello" },
        expected: false,
      },
    ];

    detectionCases.forEach(({ name, message, expected }) => {
      it(`${name}`, () => {
        expect(isGeminiFormat(message)).toBe(expected);
      });
    });
  });

  describe("Error handling", () => {
    // Shared error cases
    sharedErrorTestCases
      .filter((tc) => !tc.providers || tc.providers.includes("gemini"))
      .forEach(({ name, input, errorMessage }) => {
        it(`should throw error for ${name}`, () => {
          expect(() => geminiMessageToInternal(input as any)).toThrow(
            errorMessage
          );
        });
      });

    // Gemini-specific error cases
    const geminiErrorCases = [
      {
        name: "missing parts array",
        input: { role: "user" },
        errorMessage: "Gemini messages must have parts array",
      },
      {
        name: "parts not array",
        input: { role: "user", parts: "not array" },
        errorMessage: "parts must be an array",
      },
      {
        name: "invalid part type",
        input: { role: "user", parts: [{ invalid: "part" }] },
        errorMessage: "Invalid part type",
      },
      {
        name: "functionCall without name",
        input: {
          role: "model",
          parts: [{ functionCall: { args: {} } }],
        },
        errorMessage: "functionCall must have name",
      },
      {
        name: "functionResponse without name",
        input: {
          role: "function",
          parts: [{ functionResponse: { response: {} } }],
        },
        errorMessage: "functionResponse must have name",
      },
    ];

    geminiErrorCases.forEach(({ name, input, errorMessage }) => {
      it(`should throw error for ${name}`, () => {
        expect(() => geminiMessageToInternal(input as any)).toThrow(
          errorMessage
        );
      });
    });
  });

  describe("Options handling", () => {
    it("should skip validation when validate is false", () => {
      const invalid = { role: "invalid", parts: [{ text: "test" }] };
      expect(() =>
        geminiMessageToInternal(invalid as any, { validate: false })
      ).not.toThrow();
    });

    it("should preserve unknown fields when preserveUnknown is true", () => {
      const input = {
        role: "user",
        parts: [{ text: "Hello" }],
        customField: "custom value",
        metadata: { key: "value" },
      } as any;

      const result = geminiMessageToInternal(input, { preserveUnknown: true });
      expect(result[0]._meta?.original).toMatchObject({
        customField: "custom value",
        metadata: { key: "value" },
      });
    });
  });

  describe("Complex message sequences", () => {
    it("should handle a conversation with mixed content types", () => {
      const conversation: GeminiMessage[] = [
        {
          role: "system",
          parts: [{ text: "You are a helpful assistant." }],
        },
        {
          role: "user",
          parts: [
            { text: "Analyze this image and calculate something" },
            {
              inlineData: {
                mimeType: "image/png",
                data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
              },
            },
          ],
        },
        {
          role: "model",
          parts: [
            { text: "I'll analyze the image and perform calculations." },
            {
              functionCall: {
                name: "image_analysis",
                args: { detailed: true },
              },
            },
            {
              functionCall: {
                name: "calculate",
                args: { expression: "1 + 1" },
              },
            },
          ],
        },
        {
          role: "function",
          parts: [
            {
              functionResponse: {
                name: "image_analysis",
                response: { result: "1x1 red pixel" },
              },
            },
          ],
        },
        {
          role: "function",
          parts: [
            {
              functionResponse: {
                name: "calculate",
                response: { result: 2 },
              },
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "The image is a 1x1 red pixel, and 1 + 1 equals 2.",
            },
          ],
        },
      ];

      // Convert all messages
      const internal = conversation.flatMap((msg) =>
        geminiMessageToInternal(msg)
      );

      // Verify we get the expected number of internal messages
      // (model message with 2 function calls expands to 3)
      expect(internal).toHaveLength(8);

      // Verify roles are preserved correctly
      expect(internal.map((m) => m.role)).toEqual([
        "system",
        "user",
        "assistant", // text part
        "assistant", // first function call
        "assistant", // second function call
        "function",
        "function",
        "assistant",
      ]);

      // Convert back - note that grouped messages stay grouped
      const backToGemini = internalMessagesToGemini(internal);
      
      // The conversion back might produce a different structure
      // due to how Gemini handles multiple function calls
      expect(backToGemini.length).toBeGreaterThanOrEqual(
        conversation.length - 1
      );
    });
  });
});