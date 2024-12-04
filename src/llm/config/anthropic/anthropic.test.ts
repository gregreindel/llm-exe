import { anthropic, anthropicPromptSanitize } from "@/llm/config/anthropic";
import { IChatMessages } from "@/types";

describe("anthropicPromptSanitize", () => {
  it("should handle string messages", () => {
    const result = anthropicPromptSanitize("Hello, World!", {}, {});
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

describe("anthropic config", () => {
  const config = anthropic["anthropic.chat.v1"];

  it("should have correct configuration properties", () => {
    expect(config).toEqual(
      expect.objectContaining({
        key: "anthropic.chat.v1",
        provider: "anthropic.chat",
        endpoint: "https://api.anthropic.com/v1/messages",
        headers: expect.any(String),
        method: "POST",
        options: expect.objectContaining({
          prompt: expect.any(Object),
          system: expect.any(Object),
          maxTokens: expect.any(Object),
          anthropicApiKey: expect.any(Object),
        }),
        mapBody: expect.objectContaining({
          model: expect.any(Object),
          maxTokens: expect.any(Object),
          system: expect.any(Object),
          prompt: expect.objectContaining({
            key: "messages",
            sanitize: anthropicPromptSanitize,
          }),
        }),
      })
    );
  });

  it("should have the correct header structure", () => {
    const headers = JSON.parse(config.headers);
    expect(headers).toEqual(
      expect.objectContaining({
        "x-api-key": "{{anthropicApiKey}}",
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      })
    );
  });

  it("should have correct options required properties", () => {
    expect(config.options.maxTokens.required).toEqual(expect.arrayContaining([true, "maxTokens required"]));
  });
});