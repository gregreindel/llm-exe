import { describe, expect, it } from "@jest/globals";
import {
  geminiMessageToInternal,
  internalMessagesToGemini,
  isGeminiFormat,
} from "./gemini";
import { GeminiMessage } from "./gemini";
import { InternalMessage } from "@/interfaces";

describe("Gemini Message Converter", () => {


  describe("Gemini to Internal conversion", () => {
    it("should convert simple text message", () => {
      const input = {
        role: "user",
        parts: [{ text: "Hello, world!" }]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        role: "user",
        content: [{ type: "text", text: "Hello, world!" }],
        _meta: {
          original: {
            provider: "gemini",
            hasMultipleParts: true
          }
        }
      });
    });

    it("should convert model role to assistant", () => {
      const input = {
        role: "model",
        parts: [{ text: "I can help with that" }]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("assistant");
      expect(result[0].content).toEqual([{ type: "text", text: "I can help with that" }]);
    });

    it("should convert multiple text parts", () => {
      const input = {
        role: "user",
        parts: [
          { text: "First part" },
          { text: "Second part" }
        ]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].content).toEqual([
        { type: "text", text: "First part" },
        { type: "text", text: "Second part" }
      ]);
    });

    it("should convert inline image data", () => {
      const input = {
        role: "user",
        parts: [
          { text: "Look at this image:" },
          {
            inlineData: {
              mimeType: "image/png",
              data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
            }
          }
        ]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].content).toEqual([
        { type: "text", text: "Look at this image:" },
        {
          type: "image",
          mediaType: "image/png",
          source: {
            type: "base64",
            data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
          }
        }
      ]);
    });

    it("should convert file data with URL", () => {
      const input = {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: "application/pdf",
              fileUri: "gs://bucket/document.pdf"
            }
          }
        ]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].content[0]).toEqual({
        type: "image",
        mediaType: "application/pdf",
        source: {
          type: "url",
          url: "gs://bucket/document.pdf"
        }
      });
    });

    it("should convert function call", () => {
      const input = {
        role: "model",
        parts: [
          {
            functionCall: {
              name: "get_weather",
              args: { location: "NYC", unit: "fahrenheit" }
            }
          }
        ]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("assistant");
      expect(result[0].content).toEqual([]);
      expect(result[0].function_call).toEqual({
        name: "get_weather",
        arguments: '{"location":"NYC","unit":"fahrenheit"}'
      });
    });

    it("should convert text with function call", () => {
      const input = {
        role: "model",
        parts: [
          { text: "Let me check the weather for you" },
          {
            functionCall: {
              name: "get_weather",
              args: { location: "Paris" }
            }
          }
        ]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(2);
      
      // First message has text
      expect(result[0].role).toBe("assistant");
      expect(result[0].content).toEqual([{ type: "text", text: "Let me check the weather for you" }]);
      expect(result[0]._meta?.group).toBeDefined();
      
      // Second message has function call
      expect(result[1].role).toBe("assistant");
      expect(result[1].function_call).toEqual({
        name: "get_weather",
        arguments: '{"location":"Paris"}'
      });
      expect(result[1]._meta?.group?.id).toBe(result[0]._meta?.group?.id);
    });

    it("should convert multiple function calls", () => {
      const input = {
        role: "model",
        parts: [
          {
            functionCall: {
              name: "get_weather",
              args: { location: "NYC" }
            }
          },
          {
            functionCall: {
              name: "get_time",
              args: { timezone: "EST" }
            }
          }
        ]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(2);
      
      // Both should be function calls with same group
      const groupId = result[0]._meta?.group?.id;
      expect(groupId).toBeDefined();
      expect(result[0].function_call?.name).toBe("get_weather");
      expect(result[1].function_call?.name).toBe("get_time");
      expect(result[1]._meta?.group?.id).toBe(groupId);
    });

    it("should convert function response", () => {
      const input = {
        role: "function",
        parts: [
          {
            functionResponse: {
              name: "get_weather",
              response: {
                temperature: 72,
                conditions: "sunny"
              }
            }
          }
        ]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("function");
      expect(result[0].name).toBe("get_weather");
      expect(result[0].content).toEqual([
        { type: "text", text: '{"temperature":72,"conditions":"sunny"}' }
      ]);
    });

    it("should handle empty parts array", () => {
      const input = {
        role: "user",
        parts: []
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].content).toEqual([]);
      expect(result[0]._meta?.original?.hadEmptyParts).toBe(true);
    });

    it("should handle mixed content types", () => {
      const input = {
        role: "user",
        parts: [
          { text: "Here's an image and let me calculate something" },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: "base64data"
            }
          },
          { text: "What do you think?" }
        ]
      };
      const result = geminiMessageToInternal(input);
      expect(result).toHaveLength(1);
      expect(result[0].content).toHaveLength(3);
      expect(result[0].content[0].type).toBe("text");
      expect(result[0].content[1].type).toBe("image");
      expect(result[0].content[2].type).toBe("text");
    });
  });

  describe("Internal to Gemini conversion", () => {
    it("should convert simple text message", () => {
      const input: InternalMessage[] = [{
        role: "user",
        content: [{ type: "text" as const, text: "Hello, world!" }]
      }];
      const result = internalMessagesToGemini(input);
      expect(result).toEqual([{
        role: "user",
        parts: [{ text: "Hello, world!" }]
      }]);
    });

    it("should convert assistant to model role", () => {
      const input: InternalMessage[] = [{
        role: "assistant",
        content: [{ type: "text" as const, text: "I can help" }]
      }];
      const result = internalMessagesToGemini(input);
      expect(result).toEqual([{
        role: "model",
        parts: [{ text: "I can help" }]
      }]);
    });

    it("should convert system messages to user with prefix", () => {
      const input: InternalMessage[] = [{
        role: "system",
        content: [{ type: "text" as const, text: "You are helpful" }]
      }];
      const result = internalMessagesToGemini(input);
      expect(result).toEqual([{
        role: "user",
        parts: [{ text: "[System] You are helpful" }]
      }]);
    });

    it("should convert function call", () => {
      const input: InternalMessage[] = [{
        role: "assistant",
        content: [],
        function_call: {
          name: "get_weather",
          arguments: '{"location": "NYC"}'
        }
      }];
      const result = internalMessagesToGemini(input);
      expect(result).toEqual([{
        role: "model",
        parts: [{
          functionCall: {
            name: "get_weather",
            args: { location: "NYC" }
          }
        }]
      }]);
    });

    it("should convert function response with text result", () => {
      const input: InternalMessage[] = [{
        role: "function",
        name: "get_weather",
        content: [{ type: "text" as const, text: '{"temp": 72, "desc": "sunny"}' }]
      }];
      const result = internalMessagesToGemini(input);
      // Gemini puts function responses in user messages
      expect(result).toEqual([{
        role: "user",
        parts: [{
          functionResponse: {
            name: "get_weather",
            response: { result: { temp: 72, desc: "sunny" } }
          }
        }]
      }]);
    });

    it("should convert function response with JSON result", () => {
      const input: InternalMessage[] = [{
        role: "function",
        name: "get_weather",
        content: [{ type: "text" as const, text: '{"temp": 72, "conditions": "sunny"}' }]
      }];
      const result = internalMessagesToGemini(input);
      expect(result).toEqual([{
        role: "user",
        parts: [{
          functionResponse: {
            name: "get_weather",
            response: { result: { temp: 72, conditions: "sunny" } }
          }
        }]
      }]);
    });

    it("should group consecutive function responses", () => {
      const input: InternalMessage[] = [
        {
          role: "function",
          name: "get_weather",
          content: [{ type: "text" as const, text: "NYC: 72F" }]
        },
        {
          role: "function",
          name: "get_time",
          content: [{ type: "text" as const, text: "3:00 PM EST" }]
        }
      ];
      const result = internalMessagesToGemini(input);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("user");
      expect(result[0].parts).toHaveLength(2);
      expect((result[0].parts[0] as any).functionResponse?.name).toBe("get_weather");
      expect((result[0].parts[1] as any).functionResponse?.name).toBe("get_time");
    });

    it("should convert grouped assistant messages", () => {
      const input: InternalMessage[] = [
        {
          role: "assistant",
          content: [{ type: "text" as const, text: "Let me check both" }],
          _meta: {
            group: { id: "group_123", position: 0, total: 3 },
            original: { provider: "gemini" }
          }
        },
        {
          role: "assistant",
          content: [],
          function_call: {
            name: "get_weather",
            arguments: '{"location": "NYC"}'
          },
          _meta: {
            group: { id: "group_123", position: 1, total: 3 },
            original: { provider: "gemini" }
          }
        },
        {
          role: "assistant",
          content: [],
          function_call: {
            name: "get_time",
            arguments: '{"timezone": "EST"}'
          },
          _meta: {
            group: { id: "group_123", position: 2, total: 3 },
            original: { provider: "gemini" }
          }
        }
      ];
      const result = internalMessagesToGemini(input);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe("model");
      expect(result[0].parts).toHaveLength(3);
      expect(result[0].parts[0]).toEqual({ text: "Let me check both" });
      expect((result[0].parts[1] as any).functionCall?.name).toBe("get_weather");
      expect((result[0].parts[2] as any).functionCall?.name).toBe("get_time");
    });

    it("should convert base64 images", () => {
      const input: InternalMessage[] = [{
        role: "user",
        content: [{
          type: "image" as const,
          mediaType: "image/png",
          source: {
            type: "base64" as const,
            data: "base64data"
          }
        }]
      }];
      const result = internalMessagesToGemini(input);
      expect(result).toEqual([{
        role: "user",
        parts: [{
          inlineData: {
            mimeType: "image/png",
            data: "base64data"
          }
        }]
      }]);
    });

    it("should convert URL images", () => {
      const input: InternalMessage[] = [{
        role: "user",
        content: [{
          type: "image" as const,
          mediaType: "image/jpeg",
          source: {
            type: "url" as const,
            url: "https://example.com/image.jpg"
          }
        }]
      }];
      const result = internalMessagesToGemini(input);
      expect(result).toEqual([{
        role: "user",
        parts: [{
          fileData: {
            mimeType: "image/jpeg",
            fileUri: "https://example.com/image.jpg"
          }
        }]
      }]);
    });

    it("should handle empty content", () => {
      const input: InternalMessage[] = [{
        role: "assistant",
        content: [],
        _meta: {
          original: { 
            provider: "gemini" as const,
            hadEmptyParts: true 
          }
        }
      }];
      const result = internalMessagesToGemini(input);
      expect(result).toEqual([{
        role: "model",
        parts: []
      }]);
    });

    it("should skip unsupported content types", () => {
      const input: InternalMessage[] = [{
        role: "user",
        content: [
          { type: "text" as const, text: "Check this audio" },
          { type: "audio" as const, mediaType: "audio/mp3", source: { type: "url" as const, url: "audio.mp3" } },
          { type: "text" as const, text: "What do you hear?" }
        ]
      }];
      const result = internalMessagesToGemini(input);
      expect(result).toEqual([{
        role: "user",
        parts: [
          { text: "Check this audio" },
          { text: "What do you hear?" }
        ]
      }]);
    });
  });

  describe("Bidirectional conversion (round-trip)", () => {
    it("should round-trip simple text message", () => {
      const original = {
        role: "user",
        parts: [{ text: "Hello" }]
      };
      const internal = geminiMessageToInternal(original);
      const back = internalMessagesToGemini(internal);
      expect(back).toEqual([original]);
    });

    it("should round-trip model message", () => {
      const original = {
        role: "model",
        parts: [{ text: "Hi there" }]
      };
      const internal = geminiMessageToInternal(original);
      const back = internalMessagesToGemini(internal);
      expect(back).toEqual([original]);
    });

    it("should round-trip image content", () => {
      const original = {
        role: "user",
        parts: [
          { text: "Look at this:" },
          {
            inlineData: {
              mimeType: "image/png",
              data: "base64data"
            }
          }
        ]
      };
      const internal = geminiMessageToInternal(original);
      const back = internalMessagesToGemini(internal);
      expect(back).toEqual([original]);
    });

    it("should round-trip empty parts", () => {
      const original = {
        role: "user",
        parts: []
      };
      const internal = geminiMessageToInternal(original);
      const back = internalMessagesToGemini(internal);
      expect(back).toEqual([original]);
    });
  });

  describe("Format detection", () => {
    it("should detect model role", () => {
      expect(isGeminiFormat({ role: "model", parts: [] })).toBe(true);
    });

    it("should detect text part", () => {
      expect(isGeminiFormat({ text: "hello" })).toBe(true);
    });

    it("should detect functionCall", () => {
      expect(isGeminiFormat({ functionCall: { name: "test", args: {} } })).toBe(true);
    });

    it("should detect functionResponse", () => {
      expect(isGeminiFormat({ functionResponse: { name: "test", response: {} } })).toBe(true);
    });

    it("should not detect other formats", () => {
      expect(isGeminiFormat({ role: "user", content: "text" })).toBe(false);
      expect(isGeminiFormat({ role: "assistant", content: [] })).toBe(false);
      expect(isGeminiFormat(null)).toBe(false);
      expect(isGeminiFormat({})).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("should throw error for invalid role", () => {
      expect(() => geminiMessageToInternal({ role: "invalid", parts: [] } as any))
        .toThrow("Invalid role: invalid");
    });

    it("should throw error for missing parts", () => {
      expect(() => geminiMessageToInternal({ role: "user" } as any))
        .toThrow("Parts must be an array");
    });

    it("should throw error for non-array parts", () => {
      expect(() => geminiMessageToInternal({ role: "user", parts: "not array" } as any))
        .toThrow("Parts must be an array");
    });

    it("should throw error for invalid part type", () => {
      expect(() => geminiMessageToInternal({ role: "user", parts: [{ invalid: "part" }] } as any))
        .toThrow("Invalid part type at index 0");
    });

    it("should throw error for non-object part", () => {
      expect(() => geminiMessageToInternal({ role: "user", parts: ["string"] } as any))
        .toThrow("Invalid part at index 0: must be an object");
    });

    it("should throw error for functionCall in user message", () => {
      expect(() => geminiMessageToInternal({
        role: "user",
        parts: [{ functionCall: { name: "test", args: {} } }]
      } as any)).toThrow("User messages cannot contain functionCall");
    });

    it("should throw error for functionResponse in model message", () => {
      expect(() => geminiMessageToInternal({
        role: "model",
        parts: [{ functionResponse: { name: "test", response: {} } }]
      } as any)).toThrow("Model messages cannot contain functionResponse");
    });

    it("should throw error for functionCall without name", () => {
      expect(() => geminiMessageToInternal({
        role: "model",
        parts: [{ functionCall: { args: {} } }]
      } as any)).toThrow("Invalid part type at index 0");
    });

    it("should throw error for functionResponse without name", () => {
      expect(() => geminiMessageToInternal({
        role: "function",
        parts: [{ functionResponse: { response: {} } }]
      } as any)).toThrow("Invalid part type at index 0");
    });

    it("should throw error for non-serializable function args", () => {
      const circular: any = {};
      circular.self = circular;
      expect(() => geminiMessageToInternal({
        role: "model",
        parts: [{ functionCall: { name: "test", args: circular } }]
      } as any)).toThrow("Invalid function args at index 0: not serializable");
    });

    it("should throw error for non-serializable function response", () => {
      const circular: any = {};
      circular.self = circular;
      expect(() => geminiMessageToInternal({
        role: "function",
        parts: [{ functionResponse: { name: "test", response: circular } }]
      } as any)).toThrow("Invalid function response at index 0: not serializable");
    });
  });

  describe("Options handling", () => {
    it("should skip validation when validate is false", () => {
      const invalid = { role: "invalid", parts: [{ text: "test" }] };
      expect(() =>
        geminiMessageToInternal(invalid as any, { validate: false })
      ).not.toThrow();
    });

    it("should use custom ID generator", () => {
      const customId = () => "custom_id_123";
      const input = {
        role: "model",
        parts: [
          { text: "Let me help" },
          { functionCall: { name: "test", args: {} } }
        ]
      };
      const result = geminiMessageToInternal(input, { generateId: customId });
      // When there's text + function call, it creates a group
      expect(result.length).toBe(2);
      expect(result[0]._meta?.group?.id).toBe("group_custom_id_123");
      expect(result[1]._meta?.group?.id).toBe("group_custom_id_123");
    });

    it("should handle strict mode for unknown roles", () => {
      const internal: InternalMessage[] = [{
        role: "unknown",
        content: [{ type: "text" as const, text: "test" }]
      }];
      
      // Should throw in strict mode (default)
      expect(() => internalMessagesToGemini(internal))
        .toThrow("Cannot convert role 'unknown' to Gemini format");
      
      // Should convert to user in non-strict mode
      const result = internalMessagesToGemini(internal, { strict: false });
      expect(result).toEqual([{
        role: "user",
        parts: [{ text: "test" }]
      }]);
    });
  });

  describe("Complex message sequences", () => {
    it("should handle a conversation with mixed content types", () => {
      const conversation: GeminiMessage[] = [
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

      // Convert all messages to internal
      const internal = conversation.flatMap((msg) =>
        geminiMessageToInternal(msg)
      );

      // Model message with 2 function calls expands to 3 messages
      expect(internal).toHaveLength(7);

      // Verify roles
      expect(internal.map((m) => m.role)).toEqual([
        "user",
        "assistant", // text part
        "assistant", // first function call
        "assistant", // second function call  
        "function",
        "function",
        "assistant",
      ]);

      // Convert back
      const backToGemini = internalMessagesToGemini(internal);
      
      // Should reconstruct properly
      // Function responses get grouped into one user message
      expect(backToGemini).toHaveLength(4);
      expect(backToGemini[0].role).toBe("user");
      expect(backToGemini[1].role).toBe("model");
      expect(backToGemini[2].role).toBe("user"); // grouped function responses
      expect(backToGemini[3].role).toBe("model");
    });

    it("should handle conversation with system message", () => {
      const messages: InternalMessage[] = [
        {
          role: "system",
          content: [{ type: "text" as const, text: "You are helpful" }]
        },
        {
          role: "user", 
          content: [{ type: "text" as const, text: "Hello" }]
        },
        {
          role: "assistant",
          content: [{ type: "text" as const, text: "Hi there!" }]
        }
      ];

      const result = internalMessagesToGemini(messages);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        role: "user",
        parts: [{ text: "[System] You are helpful" }]
      });
      expect((result[1].parts[0] as any).text).toBe("Hello");
      expect(result[2].role).toBe("model");
    });
  });
});