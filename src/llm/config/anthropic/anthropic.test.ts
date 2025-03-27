import { anthropic } from "@/llm/config/anthropic";
import { anthropicPromptSanitize } from "./promptSanitize";

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
    expect(config.options.maxTokens.required).toEqual(
      expect.arrayContaining([true, "maxTokens required"])
    );
  });
});
