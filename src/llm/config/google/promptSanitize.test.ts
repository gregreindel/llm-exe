import { googleGeminiPromptSanitize } from "./promptSanitize";
import { googleGeminiPromptMessageCallback } from "./promptSanitizeMessageCallback";

jest.mock("./promptSanitizeMessageCallback", () => ({
  googleGeminiPromptMessageCallback: jest.fn(),
}));

describe("googleGeminiPromptSanitize", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error if input is not a string or array", () => {
    expect(() => googleGeminiPromptSanitize(
      { someWrongObject: "value" } as any,
      { someInput: "value" },
      { someOutput: "value" }
    )).toThrowError("Invalid messages format");
  });


  it("should return the string directly if _messages is a string", () => {
    const result = googleGeminiPromptSanitize(
      "Hello world",
      { someInput: "value" },
      { someOutput: "value" }
    );
    expect(result).toEqual( [{ role: "user", parts: [{ text: "Hello world" }] }]);
    expect(googleGeminiPromptMessageCallback).not.toHaveBeenCalled();
  });

  it("should throw an error if _messages is an empty array", () => {
    expect(() =>
      googleGeminiPromptSanitize([], {}, {})
    ).toThrowError("Empty messages array");
    expect(googleGeminiPromptMessageCallback).not.toHaveBeenCalled();
  });

  it("should return the single user message if provided a single system message", () => {
    const result = googleGeminiPromptSanitize(
      [{ role: "system", content: "Hello World" }],
      { someInput: "value" },
      { someOutput: "value" }
    );
    expect(result).toEqual([
      { role: "user", parts: [{ text: "Hello World" }] }
    ]);
    expect(googleGeminiPromptMessageCallback).not.toHaveBeenCalled();
  });

  it("should return the single user message and system message moved to system message input", () => {
    const out = {};
    googleGeminiPromptSanitize(
      [{ role: "system", content: "Hello World", }, { role: "user", content: "User message" }],
      { someInput: "value" },
      out
    );

    expect((out as any).system_instruction).toEqual(
      { parts: [{ text: "Hello World" }] }
    );
    expect(googleGeminiPromptMessageCallback).toHaveBeenCalledTimes(1);
  });

  it("should map the array of messages using googleGeminiPromptMessageCallback if _messages is a non-empty array", () => {
    (googleGeminiPromptMessageCallback as jest.Mock).mockImplementation(
      (msg) => ({ ...msg, processed: true })
    );
    const mockArray = [{ text: "msg1" }, { text: "msg2" }] as any;
    const result = googleGeminiPromptSanitize(mockArray, {}, {});

    expect(googleGeminiPromptMessageCallback).toHaveBeenCalledTimes(2);
    expect(googleGeminiPromptMessageCallback).toHaveBeenCalledWith(
      mockArray[0], 0, mockArray
    );
    expect(googleGeminiPromptMessageCallback).toHaveBeenCalledWith(
      mockArray[1], 1, mockArray
    );
    expect(result).toEqual([
      { text: "msg1", processed: true },
      { text: "msg2", processed: true },
    ]);
  });
});