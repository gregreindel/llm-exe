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

  describe("deprecated shorthands still resolve", () => {
    it.each([
      ["anthropic.claude-3-7-sonnet", "claude-3-7-sonnet-20250219"],
      ["anthropic.claude-3-5-sonnet", "claude-3-5-sonnet-latest"],
      ["anthropic.claude-3-5-haiku", "claude-3-5-haiku-latest"],
      ["anthropic.claude-3-opus", "claude-3-opus-20240229"],
    ] as const)(
      "%s should resolve to %s",
      (shorthand, expectedModel) => {
        const cfg = anthropic[shorthand];
        expect(cfg).toBeDefined();
        expect(cfg.options.model.default).toBe(expectedModel);
      }
    );
  });

  describe("active shorthands", () => {
    it.each([
      ["anthropic.claude-opus-4-6", "claude-opus-4-6"],
      ["anthropic.claude-sonnet-4-6", "claude-sonnet-4-6"],
      ["anthropic.claude-sonnet-4", "claude-sonnet-4-0"],
      ["anthropic.claude-opus-4", "claude-opus-4-0"],
    ] as const)(
      "%s should resolve to %s",
      (shorthand, expectedModel) => {
        const cfg = anthropic[shorthand];
        expect(cfg).toBeDefined();
        expect(cfg.options.model.default).toBe(expectedModel);
      }
    );
  });
});
