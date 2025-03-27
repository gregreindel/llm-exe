import { IChatMessages } from "@/interfaces";
import { anthropicPromptSanitize } from "./promptSanitize";

describe("anthropicPromptSanitize", () => {
  it("should handle string messages", () => {
    const result = anthropicPromptSanitize("Hello, World!", {}, {});
    expect(result).toEqual([{ role: "user", content: "Hello, World!" }]);
  });

  it("should handle IChatMessages with single system message first", () => {
    const messages: IChatMessages = [
      { role: "system", content: "Hello, World!" }
    ];
    const outputObj: Record<string, any> = {};
    const result = anthropicPromptSanitize(messages, {}, outputObj);

    expect(outputObj).toEqual({});
    expect(result).toEqual([{ role: "user", content: "Hello, World!" }]);
  });

  it("should handle IChatMessages with system message first", () => {
    const messages: IChatMessages = [
      { role: "system", content: "This is a system message" },
      { role: "user", content: "Hello, World!" },
    ];
    const outputObj: Record<string, any> = {};
    const result = anthropicPromptSanitize(messages, {}, outputObj);

    expect(outputObj).toEqual({ system: "This is a system message" });
    expect(result).toEqual([{ role: "user", content: "Hello, World!" }]);
  });

  it("should handle IChatMessages without system message first", () => {
    const messages: IChatMessages = [
      { role: "user", content: "Hello, World!" },
      { role: "assistant", content: "Hi there!" },
    ];
    const outputObj: Record<string, any> = {};
    const result = anthropicPromptSanitize(messages, {}, outputObj);

    expect(outputObj).toEqual({});
    expect(result).toEqual(messages);
  });
});