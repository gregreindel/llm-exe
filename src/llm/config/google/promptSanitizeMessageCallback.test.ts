import { IChatMessage } from "@/types";
import { googleGeminiPromptMessageCallback } from "./promptSanitizeMessageCallback";

describe("googleGeminiPromptMessageCallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("transforms 'assistant' role to 'model' and pushes string content into parts", () => {
    const message: IChatMessage = {
      role: "assistant",
      content: "Hello from assistant",
    };

    const result = googleGeminiPromptMessageCallback(message);

    expect(result).toEqual({
      role: "model",
      parts: [{ text: "Hello from assistant" }],
    });
  });

  it("transforms 'system' role to 'model' and pushes string content into parts", () => {
    const message: IChatMessage = {
      role: "system",
      content: "System message",
    };

    const result = googleGeminiPromptMessageCallback(message);

    expect(result).toEqual({
      role: "model",
      parts: [{ text: "System message" }],
    });
  });

  it("leaves role unchanged if it is neither 'assistant' nor 'system', and still pushes string content", () => {
    const message: IChatMessage = {
      role: "user",
      content: "User message",
    };

    const result = googleGeminiPromptMessageCallback(message);

    expect(result).toEqual({
      role: "user",
      parts: [{ text: "User message" }],
    });
  });

  it("returns empty parts if content is not a string", () => {
    const message: IChatMessage = {
      role: "assistant",
      content: { some: "object" } as any,
    };

    const result = googleGeminiPromptMessageCallback(message);

    expect(result).toEqual({
      role: "model",
      parts: [],
    });
  });

  it("returns empty parts if content is undefined", () => {
    const message: IChatMessage = {
      role: "assistant",
      content: undefined as any,
    };

    const result = googleGeminiPromptMessageCallback(message);

    expect(result).toEqual({
      role: "model",
      parts: [],
    });
  });

  describe("function role handling", () => {
    it("transforms 'function' role to 'user' and creates functionResponse part", () => {
      const message: IChatMessage = {
        role: "function",
        name: "testFunction",
        content: "Function result",
      };

      const result = googleGeminiPromptMessageCallback(message);

      expect(result).toEqual({
        role: "user",
        parts: [
          {
            text: "Function result",
          },
          {
            functionResponse: {
              name: "testFunction",
              response: {
                result: "Function result",
              },
            },
          },
        ],
      });
    });

    it("removes id field when role is function", () => {
      const message: IChatMessage = {
        role: "function",
        name: "testFunction",
        content: "Function result",
        id: "test-id",
      };

      const result = googleGeminiPromptMessageCallback(message);

      expect(result).toEqual({
        role: "user",
        parts: [
          {
            text: "Function result",
          },
          {
            functionResponse: {
              name: "testFunction",
              response: {
                result: "Function result",
              },
            },
          },
        ],
      });
      expect(result).not.toHaveProperty("id");
    });
  });

  describe("function_call handling", () => {
    it("handles single function_call object", () => {
      const message: IChatMessage = {
        role: "user",
        content: "Call a function",
        function_call: {
          name: "getWeather",
          arguments: JSON.stringify({ location: "Paris" }),
        },
      } as any;

      const result = googleGeminiPromptMessageCallback(message);

      expect(result).toEqual({
        role: "model",
        parts: [
          { text: "Call a function" },
          {
            functionCall: {
              name: "getWeather",
              args: { location: "Paris" },
            },
          },
        ],
      });
    });

    it("handles array of function_call objects", () => {
      const message: IChatMessage = {
        role: "assistant",
        content: "Calling multiple functions",
        function_call: [
          {
            name: "getWeather",
            arguments: JSON.stringify({ location: "Paris" }),
          },
          {
            name: "getTime",
            arguments: JSON.stringify({ timezone: "UTC" }),
          },
        ],
      } as any;

      const result = googleGeminiPromptMessageCallback(message);

      expect(result).toEqual({
        role: "model",
        parts: [
          { text: "Calling multiple functions" },
          {
            functionCall: {
              name: "getWeather",
              args: { location: "Paris" },
            },
          },
          {
            functionCall: {
              name: "getTime",
              args: { timezone: "UTC" },
            },
          },
        ],
      });
    });

    it("handles function_call with plain object arguments", () => {
      const message: IChatMessage = {
        role: "user",
        content: "Test",
        function_call: {
          name: "testFunc",
          arguments: { already: "parsed" },
        },
      } as any;

      const result = googleGeminiPromptMessageCallback(message);

      expect(result).toEqual({
        role: "model",
        parts: [
          { text: "Test" },
          {
            functionCall: {
              name: "testFunc",
              args: { already: "parsed" },
            },
          },
        ],
      });
    });

    it("sets role to model when function_call is present", () => {
      const message: IChatMessage = {
        role: "user",
        content: "",
        function_call: {
          name: "test",
          arguments: "{}",
        },
      } as any;

      const result = googleGeminiPromptMessageCallback(message);

      expect(result.role).toEqual("model");
    });

    it("removes function_call property from result", () => {
      const message: IChatMessage = {
        role: "user",
        content: "Test",
        function_call: {
          name: "test",
          arguments: "{}",
        },
      } as any;

      const result = googleGeminiPromptMessageCallback(message);

      expect(result).not.toHaveProperty("function_call");
    });
  });

  describe("edge cases", () => {
    it("handles message with both function role and function_call", () => {
      const message: IChatMessage = {
        role: "function",
        name: "funcName",
        content: "result",
        function_call: {
          name: "anotherFunc",
          arguments: "{}",
        },
      } as any;

      const result = googleGeminiPromptMessageCallback(message);

      // function_call handling should override role to model
      expect(result).toEqual({
        role: "model",
        parts: [
          { text: "result" },
          {
            functionResponse: {
              name: "funcName",
              response: {
                result: "result",
              },
            },
          },
          {
            functionCall: {
              name: "anotherFunc",
              args: {},
            },
          },
        ],
      });
    });

    it("handles empty function_call array", () => {
      const message: IChatMessage = {
        role: "user",
        content: "Test",
        function_call: [],
      } as any;

      const result = googleGeminiPromptMessageCallback(message);

      expect(result).toEqual({
        role: "model",
        parts: [{ text: "Test" }],
      });
    });
  });
});
