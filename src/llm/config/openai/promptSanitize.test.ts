import { openaiPromptSanitize } from "./promptSanitize";
import { openaiPromptMessageCallback } from "./promptSanitizeMessageCallback";

jest.mock("./promptSanitizeMessageCallback", () => ({
  openaiPromptMessageCallback: jest.fn(),
}));

describe("openaiPromptSanitize", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should wrap string input as a user message array", () => {
    const result = openaiPromptSanitize("Hello world", {}, {});
    expect(result).toEqual([{ role: "user", content: "Hello world" }]);
    expect(openaiPromptMessageCallback).not.toHaveBeenCalled();
  });

  it("should wrap empty string as a user message array", () => {
    const result = openaiPromptSanitize("", {}, {});
    expect(result).toEqual([{ role: "user", content: "" }]);
    expect(openaiPromptMessageCallback).not.toHaveBeenCalled();
  });

  it("should map array messages through openaiPromptMessageCallback", () => {
    (openaiPromptMessageCallback as jest.Mock).mockImplementation((msg) => ({
      ...msg,
      processed: true,
    }));

    const messages = [
      { role: "system", content: "You are helpful" },
      { role: "user", content: "Hello" },
    ] as any;

    const result = openaiPromptSanitize(messages, {}, {});

    expect(openaiPromptMessageCallback).toHaveBeenCalledTimes(2);
    expect(openaiPromptMessageCallback).toHaveBeenCalledWith(
      messages[0],
      0,
      messages
    );
    expect(openaiPromptMessageCallback).toHaveBeenCalledWith(
      messages[1],
      1,
      messages
    );
    expect(result).toEqual([
      { role: "system", content: "You are helpful", processed: true },
      { role: "user", content: "Hello", processed: true },
    ]);
  });

  it("should handle single-element array", () => {
    (openaiPromptMessageCallback as jest.Mock).mockImplementation((msg) => msg);

    const messages = [{ role: "user", content: "Solo" }] as any;
    const result = openaiPromptSanitize(messages, {}, {});

    expect(openaiPromptMessageCallback).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ role: "user", content: "Solo" }]);
  });

  it("should handle empty array", () => {
    const result = openaiPromptSanitize([] as any, {}, {});

    expect(openaiPromptMessageCallback).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
