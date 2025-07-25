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
});
