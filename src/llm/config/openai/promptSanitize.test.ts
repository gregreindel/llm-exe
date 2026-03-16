import { openaiPromptSanitize } from "./promptSanitize";
import { openaiPromptMessageCallback } from "./promptSanitizeMessageCallback";

jest.mock("./promptSanitizeMessageCallback", () => ({
  openaiPromptMessageCallback: jest.fn((msg: any) => msg),
}));

describe("openaiPromptSanitize", () => {
  const mockCallback = openaiPromptMessageCallback as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("string input", () => {
    it("wraps a plain string in a user message array", () => {
      const result = openaiPromptSanitize("Hello", {}, {});
      expect(result).toEqual([{ role: "user", content: "Hello" }]);
    });

    it("does not call openaiPromptMessageCallback for string input", () => {
      openaiPromptSanitize("Hello", {}, {});
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("handles empty string input", () => {
      const result = openaiPromptSanitize("", {}, {});
      expect(result).toEqual([{ role: "user", content: "" }]);
    });

    it("handles multiline string input", () => {
      const result = openaiPromptSanitize("line1\nline2\nline3", {}, {});
      expect(result).toEqual([
        { role: "user", content: "line1\nline2\nline3" },
      ]);
    });
  });

  describe("array input (IChatMessages)", () => {
    it("maps each message through openaiPromptMessageCallback", () => {
      const messages = [
        { role: "system" as const, content: "You are helpful" },
        { role: "user" as const, content: "Hi" },
      ];

      openaiPromptSanitize(messages, {}, {});

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenCalledWith(
        { role: "system", content: "You are helpful" },
        0,
        messages
      );
      expect(mockCallback).toHaveBeenCalledWith(
        { role: "user", content: "Hi" },
        1,
        messages
      );
    });

    it("returns transformed messages", () => {
      mockCallback.mockImplementation((msg: any) => ({
        ...msg,
        transformed: true,
      }));

      const messages = [{ role: "user" as const, content: "Test" }];
      const result = openaiPromptSanitize(messages, {}, {});

      expect(result).toEqual([
        { role: "user", content: "Test", transformed: true },
      ]);
    });

    it("handles empty array", () => {
      const result = openaiPromptSanitize([], {}, {});
      expect(result).toEqual([]);
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("handles single message array", () => {
      const messages = [{ role: "user" as const, content: "Only one" }];
      openaiPromptSanitize(messages, {}, {});
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("handles multi-turn conversation", () => {
      const messages = [
        { role: "system" as const, content: "System prompt" },
        { role: "user" as const, content: "User message 1" },
        { role: "assistant" as const, content: "Assistant reply" },
        { role: "user" as const, content: "User message 2" },
      ];

      const result = openaiPromptSanitize(messages, {}, {});

      expect(mockCallback).toHaveBeenCalledTimes(4);
      expect(result).toHaveLength(4);
    });
  });
});
