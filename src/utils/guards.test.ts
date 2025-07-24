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
  isPlaceholderMessage,
  isTextContentPart,
  isInternalMessage,
  isUserMessage,
  isAssistantMessage,
  isSystemMessage,
  isToolMessage,
  isFunctionMessage,
  hasToolCall,
  isToolResponse,
  hasAnyToolCalls,
  getToolResponses,
  needsToolExecution,
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

  describe("Universal role guards", () => {
    describe("isUserMessage", () => {
      it("should return true for user messages", () => {
        expect(isUserMessage({ role: "user", content: "Hello" })).toBe(true);
      });

      it("should return false for non-user messages", () => {
        expect(isUserMessage({ role: "assistant", content: "Hi" })).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isUserMessage(null)).toBe(false);
        expect(isUserMessage(undefined)).toBe(false);
      });
    });

    describe("isAssistantMessage", () => {
      it("should return true for assistant messages", () => {
        expect(isAssistantMessage({ role: "assistant", content: "Hi" })).toBe(true);
      });

      it("should return true for model messages (Gemini)", () => {
        expect(isAssistantMessage({ role: "model", parts: [{ text: "Hi" }] })).toBe(true);
      });

      it("should return false for non-assistant messages", () => {
        expect(isAssistantMessage({ role: "user", content: "Hello" })).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isAssistantMessage(null)).toBe(false);
        expect(isAssistantMessage(undefined)).toBe(false);
      });
    });

    describe("isSystemMessage", () => {
      it("should return true for system messages", () => {
        expect(isSystemMessage({ role: "system", content: "You are helpful" })).toBe(true);
      });

      it("should return false for non-system messages", () => {
        expect(isSystemMessage({ role: "user", content: "Hello" })).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isSystemMessage(null)).toBe(false);
        expect(isSystemMessage(undefined)).toBe(false);
      });
    });

    describe("isToolMessage", () => {
      it("should return true for tool messages", () => {
        expect(isToolMessage({ role: "tool", content: "Result" })).toBe(true);
      });

      it("should return false for non-tool messages", () => {
        expect(isToolMessage({ role: "assistant", content: "Hi" })).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isToolMessage(null)).toBe(false);
        expect(isToolMessage(undefined)).toBe(false);
      });
    });

    describe("isFunctionMessage", () => {
      it("should return true for function messages", () => {
        expect(isFunctionMessage({ role: "function", name: "test", content: "Result" })).toBe(true);
      });

      it("should return false for non-function messages", () => {
        expect(isFunctionMessage({ role: "assistant", content: "Hi" })).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(isFunctionMessage(null)).toBe(false);
        expect(isFunctionMessage(undefined)).toBe(false);
      });
    });
  });

  describe("Placeholder and content guards", () => {
    describe("isPlaceholderMessage", () => {
      it("should return true for placeholder messages", () => {
        const message = {
          role: "placeholder",
          content: [{ type: "text", text: "Placeholder text" }]
        };
        expect(isPlaceholderMessage(message)).toBe(true);
      });

      it("should return false for non-placeholder messages", () => {
        const message = {
          role: "user",
          content: [{ type: "text", text: "User text" }]
        };
        expect(isPlaceholderMessage(message)).toBe(false);
      });
    });

    describe("isTextContentPart", () => {
      it("should return true for text content parts", () => {
        expect(isTextContentPart({ type: "text", text: "Hello" })).toBe(true);
      });

      it("should return false for non-text content parts", () => {
        expect(isTextContentPart({ type: "image_url", image_url: { url: "https://example.com/image.jpg" } })).toBe(false);
      });
    });
  });

  describe("InternalMessage guard", () => {
    it("should return true for valid internal messages", () => {
      const message = {
        role: "assistant",
        content: [{ type: "text", text: "Hello" }]
      };
      expect(isInternalMessage(message)).toBe(true);
    });

    it("should return true for messages with function_call", () => {
      const message = {
        role: "assistant",
        content: [{ type: "text", text: "Calling function" }],
        function_call: {
          name: "get_weather",
          arguments: '{"location": "NYC"}'
        }
      };
      expect(isInternalMessage(message)).toBe(true);
    });

    it("should return false when content is not an array", () => {
      const message = {
        role: "assistant",
        content: "String content"
      };
      expect(isInternalMessage(message)).toBe(false);
    });

    it("should return false when content items lack type", () => {
      const message = {
        role: "assistant",
        content: [{ text: "Hello" }]
      };
      expect(isInternalMessage(message)).toBe(false);
    });

    it("should return false when function_call is invalid", () => {
      const message = {
        role: "assistant",
        content: [{ type: "text", text: "Hello" }],
        function_call: "invalid"
      };
      expect(isInternalMessage(message)).toBe(false);
    });

    it("should return false for null or undefined", () => {
      expect(isInternalMessage(null)).toBe(false);
      expect(isInternalMessage(undefined)).toBe(false);
    });
  });

  describe("Tool call utilities", () => {
    describe("hasToolCall", () => {
      it("should detect legacy function_call format", () => {
        const message = {
          role: "assistant",
          function_call: { name: "test", arguments: "{}" }
        };
        expect(hasToolCall(message)).toBe(true);
      });

      it("should detect OpenAI tool_calls format", () => {
        const message = {
          role: "assistant",
          tool_calls: [{ type: "function", function: { name: "test", arguments: "{}" } }]
        };
        expect(hasToolCall(message)).toBe(true);
      });

      it("should detect Anthropic tool_use format", () => {
        const message = {
          role: "assistant",
          content: [
            { type: "text", text: "Let me help" },
            { type: "tool_use", id: "123", name: "test", input: {} }
          ]
        };
        expect(hasToolCall(message)).toBe(true);
      });

      it("should detect Gemini functionCall format", () => {
        const message = {
          role: "model",
          parts: [
            { text: "Let me help" },
            { functionCall: { name: "test", args: {} } }
          ]
        };
        expect(hasToolCall(message)).toBe(true);
      });

      it("should return false for messages without tool calls", () => {
        expect(hasToolCall({ role: "user", content: "Hello" })).toBe(false);
        expect(hasToolCall({ role: "assistant", content: [{ type: "text", text: "Hi" }] })).toBe(false);
      });

      it("should return false for null or undefined", () => {
        expect(hasToolCall(null)).toBe(false);
        expect(hasToolCall(undefined)).toBe(false);
      });
    });

    describe("isToolResponse", () => {
      it("should return true for tool messages", () => {
        expect(isToolResponse({ role: "tool", content: "Result" })).toBe(true);
      });

      it("should return true for function messages", () => {
        expect(isToolResponse({ role: "function", name: "test", content: "Result" })).toBe(true);
      });

      it("should return false for non-tool/function messages", () => {
        expect(isToolResponse({ role: "assistant", content: "Hi" })).toBe(false);
      });
    });

    describe("hasAnyToolCalls", () => {
      it("should return true if any message has tool calls", () => {
        const messages = [
          { role: "user", content: "Hello" },
          { role: "assistant", tool_calls: [{ type: "function", function: { name: "test", arguments: "{}" } }] }
        ];
        expect(hasAnyToolCalls(messages)).toBe(true);
      });

      it("should return false if no messages have tool calls", () => {
        const messages = [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there" }
        ];
        expect(hasAnyToolCalls(messages)).toBe(false);
      });
    });

    describe("getToolResponses", () => {
      it("should return all tool response messages", () => {
        const messages = [
          { role: "user", content: "Hello" },
          { role: "tool", content: "Result 1", tool_call_id: "1" },
          { role: "assistant", content: "Processing" },
          { role: "function", name: "test", content: "Result 2" }
        ];
        const toolResponses = getToolResponses(messages);
        expect(toolResponses).toHaveLength(2);
        expect(toolResponses[0].role).toBe("tool");
        expect(toolResponses[1].role).toBe("function");
      });

      it("should return empty array when no tool responses", () => {
        const messages = [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi" }
        ];
        expect(getToolResponses(messages)).toEqual([]);
      });
    });

    describe("needsToolExecution", () => {
      it("should return true if last message has tool calls", () => {
        const messages = [
          { role: "user", content: "What's the weather?" },
          { role: "assistant", tool_calls: [{ type: "function", function: { name: "get_weather", arguments: "{}" } }] }
        ];
        expect(needsToolExecution(messages)).toBe(true);
      });

      it("should return false if last message has no tool calls", () => {
        const messages = [
          { role: "assistant", tool_calls: [{ type: "function", function: { name: "get_weather", arguments: "{}" } }] },
          { role: "tool", content: "Sunny", tool_call_id: "123" }
        ];
        expect(needsToolExecution(messages)).toBe(false);
      });

      it("should return false for empty array", () => {
        expect(needsToolExecution([])).toBe(false);
      });

      it("should handle undefined last message", () => {
        expect(needsToolExecution([])).toBe(false);
      });
    });
  });
});
