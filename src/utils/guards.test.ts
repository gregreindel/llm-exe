import {
  isOpenAIAssistantToolCallMessage,
  isOpenAIToolMessage,
  isAnthropicAssistantToolMessage,
  isAnthropicUserToolResultMessage,
  isAnthropicToolUseContent,
  isAnthropicToolResultContent,
  isGeminiModelMessage,
  isGeminiUserMessage,
  isGeminiFunctionCall,
  isGeminiFunctionResponse,
  hasOpenAIToolFormat,
  hasAnthropicToolFormat,
  hasGeminiFormat,
  hasLegacyFunctionCallFormat,
  isLegacyFunctionMessage,
} from "./guards";

describe("Provider type guards", () => {
  describe("OpenAI guards", () => {
    it("should identify OpenAI assistant tool call messages", () => {
      const message = {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "call_123",
            type: "function",
            function: {
              name: "get_weather",
              arguments: '{"location":"NYC"}',
            },
          },
        ],
      };
      expect(isOpenAIAssistantToolCallMessage(message)).toBe(true);
    });

    it("should identify OpenAI tool messages", () => {
      const message = {
        role: "tool",
        content: '{"result":"data"}',
        tool_call_id: "call_123",
      };
      expect(isOpenAIToolMessage(message)).toBe(true);
    });
  });

  describe("Anthropic guards", () => {
    it("should identify Anthropic assistant tool messages", () => {
      const message = {
        role: "assistant",
        content: [
          { type: "text", text: "Let me help you with that." },
          {
            type: "tool_use",
            id: "tool_123",
            name: "calculator",
            input: { operation: "add" },
          },
        ],
      };
      expect(isAnthropicAssistantToolMessage(message)).toBe(true);
    });

    it("should identify Anthropic user tool result messages", () => {
      const message = {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tool_123",
            content: "Result: 42",
          },
        ],
      };
      expect(isAnthropicUserToolResultMessage(message)).toBe(true);
    });
  });

  describe("Gemini guards", () => {
    it("should identify Gemini model messages", () => {
      const message = {
        role: "model",
        parts: [
          { text: "Hello" },
          { functionCall: { name: "test", args: {} } },
        ],
      };
      expect(isGeminiModelMessage(message)).toBe(true);
    });

    it("should identify Gemini user messages", () => {
      const message = {
        role: "user",
        parts: [
          { text: "Hi" },
          { functionResponse: { name: "test", response: { result: "done" } } },
        ],
      };
      expect(isGeminiUserMessage(message)).toBe(true);
    });
  });

  describe("Format detection utilities", () => {
    it("should detect OpenAI tool format", () => {
      const messages = [
        { role: "user", content: "Hello" },
        {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_123",
              type: "function",
              function: { name: "test", arguments: "{}" },
            },
          ],
        },
      ];
      expect(hasOpenAIToolFormat(messages)).toBe(true);
    });

    it("should detect Anthropic tool format", () => {
      const messages = [
        { role: "user", content: "Hello" },
        {
          role: "assistant",
          content: [
            { type: "tool_use", id: "tool_123", name: "test", input: {} },
          ],
        },
      ];
      expect(hasAnthropicToolFormat(messages)).toBe(true);
    });

    it("should detect Gemini format", () => {
      const messages = [
        { role: "user", parts: [{ text: "Hello" }] },
        { role: "model", parts: [{ text: "Hi there" }] },
      ];
      expect(hasGeminiFormat(messages)).toBe(true);
    });
  });

  describe("Content type guards", () => {
    describe("isAnthropicToolUseContent", () => {
      it("should return true for valid tool use content", () => {
        const content = {
          type: "tool_use",
          id: "tool_123",
          name: "calculator",
          input: { operation: "add", a: 1, b: 2 }
        };
        expect(isAnthropicToolUseContent(content)).toBe(true);
      });

      it("should return false when type is not tool_use", () => {
        const content = {
          type: "text",
          id: "tool_123",
          name: "calculator",
          input: {}
        };
        expect(isAnthropicToolUseContent(content)).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isAnthropicToolUseContent(null)).toBe(false);
        expect(isAnthropicToolUseContent(undefined)).toBe(false);
      });
    });

    describe("isAnthropicToolResultContent", () => {
      it("should return true for valid tool result content", () => {
        const content = {
          type: "tool_result",
          tool_use_id: "tool_123",
          content: "Result: 42"
        };
        expect(isAnthropicToolResultContent(content)).toBe(true);
      });

      it("should return false when type is not tool_result", () => {
        const content = {
          type: "text",
          tool_use_id: "tool_123",
          content: "Result: 42"
        };
        expect(isAnthropicToolResultContent(content)).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isAnthropicToolResultContent(null)).toBe(false);
        expect(isAnthropicToolResultContent(undefined)).toBe(false);
      });
    });
  });

  describe("Gemini part guards", () => {
    describe("isGeminiFunctionCall", () => {
      it("should return true for valid function call part", () => {
        const part = {
          functionCall: {
            name: "search",
            args: { query: "weather" }
          }
        };
        expect(isGeminiFunctionCall(part)).toBe(true);
      });

      it("should return false when functionCall is missing", () => {
        const part = {
          text: "Hello"
        };
        expect(isGeminiFunctionCall(part)).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isGeminiFunctionCall(null)).toBe(false);
        expect(isGeminiFunctionCall(undefined)).toBe(false);
      });
    });

    describe("isGeminiFunctionResponse", () => {
      it("should return true for valid function response part", () => {
        const part = {
          functionResponse: {
            name: "search",
            response: {
              result: "Weather data"
            }
          }
        };
        expect(isGeminiFunctionResponse(part)).toBe(true);
      });

      it("should return false when functionResponse is missing", () => {
        const part = {
          text: "Hello"
        };
        expect(isGeminiFunctionResponse(part)).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isGeminiFunctionResponse(null)).toBe(false);
        expect(isGeminiFunctionResponse(undefined)).toBe(false);
      });
    });
  });

  describe("Legacy format guards", () => {
    describe("hasLegacyFunctionCallFormat", () => {
      it("should return true for assistant message with function_call", () => {
        const message = {
          role: "assistant",
          content: null,
          function_call: {
            name: "get_weather",
            arguments: '{"location":"NYC"}'
          }
        };
        expect(hasLegacyFunctionCallFormat(message)).toBe(true);
      });

      it("should return false when role is not assistant", () => {
        const message = {
          role: "user",
          function_call: {
            name: "get_weather",
            arguments: '{"location":"NYC"}'
          }
        };
        expect(hasLegacyFunctionCallFormat(message)).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(hasLegacyFunctionCallFormat(null)).toBe(false);
        expect(hasLegacyFunctionCallFormat(undefined)).toBe(false);
      });
    });

    describe("isLegacyFunctionMessage", () => {
      it("should return true for function role message", () => {
        const message = {
          role: "function",
          name: "get_weather",
          content: '{"temperature": 72}'
        };
        expect(isLegacyFunctionMessage(message)).toBe(true);
      });

      it("should return false when role is not function", () => {
        const message = {
          role: "assistant",
          name: "get_weather",
          content: '{"temperature": 72}'
        };
        expect(isLegacyFunctionMessage(message)).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isLegacyFunctionMessage(null)).toBe(false);
        expect(isLegacyFunctionMessage(undefined)).toBe(false);
      });
    });
  });
});
