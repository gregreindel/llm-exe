import { 
  isOutputResult, 
  isOutputResultContentText, 
  isToolCall, 
  hasToolCall 
} from "./guards";
import { 
  OutputResult, 
  OutputResultsText, 
  OutputResultsFunction 
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
          { type: "function_use", name: "test", input: {}, callId: "123" },
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
        callId: "call-123",
        name: "testFunction",
        input: { param: "value" },
      };
      expect(isToolCall(validFunc)).toBe(true);
    });

    it("returns true with minimal required properties", () => {
      const validFunc = {
        type: "function_use",
        callId: "123",
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

    it("returns false when missing callId", () => {
      const invalid = {
        type: "function_use",
        name: "test",
      };
      expect(isToolCall(invalid)).toBe(false);
    });

    it("returns false when missing type", () => {
      const invalid = {
        callId: "123",
        name: "test",
      };
      expect(isToolCall(invalid)).toBe(false);
    });

    it("returns false when type is not 'function_use'", () => {
      const invalid = {
        type: "text",
        callId: "123",
      };
      expect(isToolCall(invalid)).toBe(false);
    });
  });

  describe("hasToolCall", () => {
    it("returns true when array contains tool call", () => {
      const results = [
        { type: "text", text: "Hello" },
        { type: "function_use", callId: "123", name: "test", input: {} },
      ];
      expect(hasToolCall(results)).toBe(true);
    });

    it("returns true when array contains only tool calls", () => {
      const results = [
        { type: "function_use", callId: "123", name: "test1", input: {} },
        { type: "function_use", callId: "456", name: "test2", input: {} },
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
        { type: "function_use" }, // missing callId
        { callId: "123" }, // missing type
      ];
      expect(hasToolCall(results)).toBe(false);
    });

    it("returns true when at least one valid tool call exists", () => {
      const results = [
        null,
        { type: "text", text: "Hello" },
        { type: "function_use", callId: "valid-123" }, // This one is valid
        { type: "function_use" }, // Invalid - missing callId
      ];
      expect(hasToolCall(results)).toBe(true);
    });
  });
});