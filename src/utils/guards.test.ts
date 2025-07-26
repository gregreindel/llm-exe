import {
  isOutputResult,
  isOutputResultContentText,
  isToolCall,
  hasToolCall,
  isFunctionMessage,
  isUserMessage,
  isAssistantMessage,
  isSystemMessage,
  isFunctionCallMessage,
} from "./guards";
import {
  OutputResult,
  OutputResultsText,
  OutputResultsFunction,
  IChatMessage,
} from "@/interfaces";

describe("guards", () => {
  describe("isOutputResult", () => {
    it("returns true for valid OutputResult", () => {
      const validResult: OutputResult = {
        id: "test-123",
        stopReason: "stop",
        content: [],
        created: 123456,
        usage: {
          input_tokens: 10,
          output_tokens: 20,
          total_tokens: 30,
        },
      };
      expect(isOutputResult(validResult)).toBe(true);
    });

    it("returns true for OutputResult with content", () => {
      const result: OutputResult = {
        id: "test-123",
        stopReason: "length",
        content: [
          { type: "text", text: "Hello" },
          { type: "function_use", name: "test", input: {}, functionId: "123" },
        ],
        created: 123456,
        usage: {
          input_tokens: 10,
          output_tokens: 20,
          total_tokens: 30,
        },
      };
      expect(isOutputResult(result)).toBe(true);
    });

    it("returns false for null", () => {
      expect(isOutputResult(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isOutputResult(undefined)).toBe(false);
    });

    it("returns false for non-object", () => {
      expect(isOutputResult("string")).toBe(false);
      expect(isOutputResult(123)).toBe(false);
      expect(isOutputResult(true)).toBe(false);
    });

    it("returns false when missing id", () => {
      const invalid = {
        stopReason: "stop",
        content: [],
      };
      expect(isOutputResult(invalid)).toBe(false);
    });

    it("returns false when missing stopReason", () => {
      const invalid = {
        id: "test",
        content: [],
      };
      expect(isOutputResult(invalid)).toBe(false);
    });

    it("returns false when missing content", () => {
      const invalid = {
        id: "test",
        stopReason: "stop",
      };
      expect(isOutputResult(invalid)).toBe(false);
    });

    it("returns false when content is not array", () => {
      const invalid = {
        id: "test",
        stopReason: "stop",
        content: "not an array",
      };
      expect(isOutputResult(invalid)).toBe(false);
    });
  });

  describe("isOutputResultContentText", () => {
    it("returns true for valid OutputResultsText", () => {
      const validText: OutputResultsText = {
        type: "text",
        text: "Hello world",
      };
      expect(isOutputResultContentText(validText)).toBe(true);
    });

    it("returns true for empty text", () => {
      const validText: OutputResultsText = {
        type: "text",
        text: "",
      };
      expect(isOutputResultContentText(validText)).toBe(true);
    });

    it("returns false for null", () => {
      expect(isOutputResultContentText(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isOutputResultContentText(undefined)).toBe(false);
    });

    it("returns false for non-object", () => {
      expect(isOutputResultContentText("string")).toBe(false);
      expect(isOutputResultContentText(123)).toBe(false);
      expect(isOutputResultContentText(true)).toBe(false);
    });

    it("returns false when missing text property", () => {
      const invalid = {
        type: "text",
      };
      expect(isOutputResultContentText(invalid)).toBe(false);
    });

    it("returns false when missing type property", () => {
      const invalid = {
        text: "Hello",
      };
      expect(isOutputResultContentText(invalid)).toBe(false);
    });

    it("returns false when type is not 'text'", () => {
      const invalid = {
        type: "function_use",
        text: "Hello",
      };
      expect(isOutputResultContentText(invalid)).toBe(false);
    });

    it("returns false when text is not string", () => {
      const invalid = {
        type: "text",
        text: 123,
      };
      expect(isOutputResultContentText(invalid)).toBe(false);
    });
  });

  describe("isToolCall", () => {
    it("returns true for valid OutputResultsFunction", () => {
      const validFunc: OutputResultsFunction = {
        type: "function_use",
        functionId: "call-123",
        name: "testFunction",
        input: { param: "value" },
      };
      expect(isToolCall(validFunc)).toBe(true);
    });

    it("returns true with minimal required properties", () => {
      const validFunc = {
        type: "function_use",
        functionId: "123",
      };
      expect(isToolCall(validFunc)).toBe(true);
    });

    it("returns false for null", () => {
      expect(isToolCall(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isToolCall(undefined)).toBe(false);
    });

    it("returns false for non-object", () => {
      expect(isToolCall("string")).toBe(false);
      expect(isToolCall(123)).toBe(false);
      expect(isToolCall(true)).toBe(false);
    });

    it("returns false when missing functionId", () => {
      const invalid = {
        type: "function_use",
        name: "test",
      };
      expect(isToolCall(invalid)).toBe(false);
    });

    it("returns false when missing type", () => {
      const invalid = {
        functionId: "123",
        name: "test",
      };
      expect(isToolCall(invalid)).toBe(false);
    });

    it("returns false when type is not 'function_use'", () => {
      const invalid = {
        type: "text",
        functionId: "123",
      };
      expect(isToolCall(invalid)).toBe(false);
    });
  });

  describe("hasToolCall", () => {
    it("returns true when array contains tool call", () => {
      const results = [
        { type: "text", text: "Hello" },
        { type: "function_use", functionId: "123", name: "test", input: {} },
      ];
      expect(hasToolCall(results)).toBe(true);
    });

    it("returns true when array contains only tool calls", () => {
      const results = [
        { type: "function_use", functionId: "123", name: "test1", input: {} },
        { type: "function_use", functionId: "456", name: "test2", input: {} },
      ];
      expect(hasToolCall(results)).toBe(true);
    });

    it("returns false when array contains no tool calls", () => {
      const results = [
        { type: "text", text: "Hello" },
        { type: "text", text: "World" },
      ];
      expect(hasToolCall(results)).toBe(false);
    });

    it("returns false for empty array", () => {
      expect(hasToolCall([])).toBe(false);
    });

    it("returns false for null", () => {
      expect(hasToolCall(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(hasToolCall(undefined)).toBe(false);
    });

    it("returns false for non-array", () => {
      expect(hasToolCall("string")).toBe(false);
      expect(hasToolCall(123)).toBe(false);
      expect(hasToolCall({})).toBe(false);
    });

    it("returns false when array contains invalid items", () => {
      const results = [
        null,
        undefined,
        { type: "function_use" }, // missing functionId
        { functionId: "123" }, // missing type
      ];
      expect(hasToolCall(results)).toBe(false);
    });

    it("returns true when at least one valid tool call exists", () => {
      const results = [
        null,
        { type: "text", text: "Hello" },
        { type: "function_use", functionId: "valid-123" }, // This one is valid
        { type: "function_use" }, // Invalid - missing functionId
      ];
      expect(hasToolCall(results)).toBe(true);
    });
  });

  describe("Chat message type guards", () => {
    describe("isFunctionMessage", () => {
      it("returns true for function message", () => {
        const message: IChatMessage = {
          role: "function",
          content: "result",
          name: "test_function",
        };
        expect(isFunctionMessage(message)).toBe(true);
      });

      it("returns false for non-function messages", () => {
        const userMsg: IChatMessage = { role: "user", content: "hello" };
        const assistantMsg: IChatMessage = { role: "assistant", content: "hi" };
        const systemMsg: IChatMessage = { role: "system", content: "system" };

        expect(isFunctionMessage(userMsg)).toBe(false);
        expect(isFunctionMessage(assistantMsg)).toBe(false);
        expect(isFunctionMessage(systemMsg)).toBe(false);
      });
    });

    describe("isUserMessage", () => {
      it("returns true for user message", () => {
        const message: IChatMessage = { role: "user", content: "hello" };
        expect(isUserMessage(message)).toBe(true);
      });

      it("returns false for non-user messages", () => {
        const functionMsg: IChatMessage = {
          role: "function",
          content: "result",
          name: "test_function",
        };
        const assistantMsg: IChatMessage = { role: "assistant", content: "hi" };

        expect(isUserMessage(functionMsg)).toBe(false);
        expect(isUserMessage(assistantMsg)).toBe(false);
      });
    });

    describe("isAssistantMessage", () => {
      it("returns true for assistant message", () => {
        const message: IChatMessage = { role: "assistant", content: "hello" };
        expect(isAssistantMessage(message)).toBe(true);
      });

      it("returns true for model message", () => {
        const message: IChatMessage = { role: "model", content: "hello" };
        expect(isAssistantMessage(message)).toBe(true);
      });

      it("returns false for non-assistant messages", () => {
        const userMsg: IChatMessage = { role: "user", content: "hello" };
        const systemMsg: IChatMessage = { role: "system", content: "system" };

        expect(isAssistantMessage(userMsg)).toBe(false);
        expect(isAssistantMessage(systemMsg)).toBe(false);
      });
    });

    describe("isSystemMessage", () => {
      it("returns true for system message", () => {
        const message: IChatMessage = { role: "system", content: "hello" };
        expect(isSystemMessage(message)).toBe(true);
      });

      it("returns false for non-system messages", () => {
        const userMsg: IChatMessage = { role: "user", content: "hello" };
        const assistantMsg: IChatMessage = { role: "assistant", content: "hi" };

        expect(isSystemMessage(userMsg)).toBe(false);
        expect(isSystemMessage(assistantMsg)).toBe(false);
      });
    });

    describe("isFunctionCallMessage", () => {
      it("returns true for function_call message", () => {
        const message: IChatMessage = {
          role: "function_call",
          content: null,
          function_call: { name: "test", arguments: "{}" },
        };
        expect(isFunctionCallMessage(message)).toBe(true);
      });

      it("returns false for non-function_call messages", () => {
        const userMsg: IChatMessage = { role: "user", content: "hello" };
        const functionMsg: IChatMessage = {
          role: "function",
          content: "result",
          name: "test_function",
        };

        expect(isFunctionCallMessage(userMsg)).toBe(false);
        expect(isFunctionCallMessage(functionMsg)).toBe(false);
      });
    });
  });
});
