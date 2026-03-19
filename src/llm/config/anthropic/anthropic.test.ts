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
            transform: anthropicPromptSanitize,
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

  describe("model shorthands", () => {
    it("should have active model shorthands", () => {
      expect(anthropic["anthropic.claude-opus-4-6"]).toBeDefined();
      expect(anthropic["anthropic.claude-sonnet-4-6"]).toBeDefined();
      expect(anthropic["anthropic.claude-sonnet-4"]).toBeDefined();
      expect(anthropic["anthropic.claude-opus-4"]).toBeDefined();
    });

    it("should have deprecated model shorthands that still resolve", () => {
      expect(anthropic["anthropic.claude-3-7-sonnet"]).toBeDefined();
      expect(anthropic["anthropic.claude-3-7-sonnet"].mapBody.model.default).toBe(
        "claude-3-7-sonnet-20250219"
      );

      expect(anthropic["anthropic.claude-3-5-sonnet"]).toBeDefined();
      expect(anthropic["anthropic.claude-3-5-sonnet"].mapBody.model.default).toBe(
        "claude-3-5-sonnet-latest"
      );

      expect(anthropic["anthropic.claude-3-5-haiku"]).toBeDefined();
      expect(anthropic["anthropic.claude-3-5-haiku"].mapBody.model.default).toBe(
        "claude-3-5-haiku-latest"
      );

      expect(anthropic["anthropic.claude-3-opus"]).toBeDefined();
      expect(anthropic["anthropic.claude-3-haiku"]).toBeDefined();
    });
  });
});
