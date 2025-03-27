import { googleGeminiPromptSanitize } from "./promptSanitize";
import { googleGeminiPromptMessageCallback } from "./promptSanitizeMessageCallback";

jest.mock("./promptSanitizeMessageCallback", () => ({
  googleGeminiPromptMessageCallback: jest.fn(),
}));

describe("googleGeminiPromptSanitize", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the string directly if _messages is a string", () => {
    const result = googleGeminiPromptSanitize(
      "Hello world",
      { someInput: "value" },
      { someOutput: "value" }
    );
    expect(result).toBe("Hello world");
    expect(googleGeminiPromptMessageCallback).not.toHaveBeenCalled();
  });

  it("should throw an error if _messages is an empty array", () => {
    expect(() =>
      googleGeminiPromptSanitize([], {}, {})
    ).toThrowError("Empty messages array");
    expect(googleGeminiPromptMessageCallback).not.toHaveBeenCalled();
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