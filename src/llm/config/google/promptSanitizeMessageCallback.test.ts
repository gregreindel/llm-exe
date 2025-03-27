import { modifyPromptRoleChange } from "@/utils/modules/modifyPromptRoleChange";
import { IChatMessage } from "@/types";
import { googleGeminiPromptMessageCallback } from "./promptSanitizeMessageCallback";

jest.mock("@/utils/modules/modifyPromptRoleChange", () => ({
  modifyPromptRoleChange: jest.fn(),
}));

describe("googleGeminiPromptMessageCallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("transforms 'assistant' role to 'model' and pushes string content into parts", () => {
    (modifyPromptRoleChange as jest.Mock).mockReturnValue({
      role: "model",
      content: "Hello from assistant",
    });

    const message: IChatMessage = {
      role: "assistant",
      content: "Hello from assistant",
    };

    const result = googleGeminiPromptMessageCallback(message);
    expect(modifyPromptRoleChange).toHaveBeenCalledWith(message, [
      { from: "assistant", to: "model" },
    ]);
    expect(result).toEqual({
      role: "model",
      parts: [{ text: "Hello from assistant" }],
    });
  });

  it("transforms 'system' role to 'model' and pushes string content into parts", () => {
    (modifyPromptRoleChange as jest.Mock).mockReturnValue({
      role: "model",
      content: "System message",
    });

    const message: IChatMessage = {
      role: "system",
      content: "System message",
    };

    const result = googleGeminiPromptMessageCallback(message);
    expect(modifyPromptRoleChange).toHaveBeenCalledWith(message, [
      { from: "assistant", to: "model" },
    ]);
    expect(result).toEqual({
      role: "model",
      parts: [{ text: "System message" }],
    });
  });

  it("leaves role unchanged if it is neither 'assistant' nor 'system', and still pushes string content", () => {
    (modifyPromptRoleChange as jest.Mock).mockReturnValue({
      role: "user",
      content: "User message",
    });

    const message: IChatMessage = {
      role: "user",
      content: "User message",
    };

    const result = googleGeminiPromptMessageCallback(message);
    expect(modifyPromptRoleChange).toHaveBeenCalledWith(message, [
      { from: "assistant", to: "model" },
    ]);
    expect(result).toEqual({
      role: "user",
      parts: [{ text: "User message" }],
    });
  });

  it("returns empty parts if content is not a string", () => {
    (modifyPromptRoleChange as jest.Mock).mockReturnValue({
      role: "model",
      content: { some: "object" },
    });

    const message: IChatMessage = {
      role: "assistant",
      content: { some: "object" } as any,
    };

    const result = googleGeminiPromptMessageCallback(message);
    expect(modifyPromptRoleChange).toHaveBeenCalledWith(message, [
      { from: "assistant", to: "model" },
    ]);
    expect(result).toEqual({
      role: "model",
      parts: [],
    });
  });

  it("returns empty parts if content is undefined", () => {
    (modifyPromptRoleChange as jest.Mock).mockReturnValue({
      role: "assistant",
      content: undefined,
    });

    const message: IChatMessage = {
      role: "assistant",
      content: undefined as any,
    };

    const result = googleGeminiPromptMessageCallback(message);
    expect(modifyPromptRoleChange).toHaveBeenCalledWith(message, [
      { from: "assistant", to: "model" },
    ]);
    expect(result).toEqual({
      role: "assistant",
      parts: [],
    });
  });
});