import { xai } from "@/llm/config/x";
import { Config } from "@/types";

describe("openai configuration", () => {
  const xAiChatV1 = xai["xai.chat.v1"] as Config;

  describe("xai.chat.v1", () => {
    it("should have the correct key, provider, endpoint, and method", () => {
      expect(xAiChatV1.key).toBe("xai.chat.v1");
      expect(xAiChatV1.provider).toBe("xai.chat");
      expect(xAiChatV1.endpoint).toBe("https://api.x.ai/v1/chat/completions");
      expect(xAiChatV1.method).toBe("POST");
    });

    it("should have correct headers", () => {
      expect(xAiChatV1.headers).toBe(
        `{"Authorization":"Bearer {{xAiApiKey}}", "Content-Type": "application/json" }`
      );
    });

    it("should transform the prompt correctly", () => {
      const transformPrompt = xAiChatV1.mapBody.prompt.transform as (
        v: any
      ) => any;
      expect(transformPrompt("Hello")).toEqual([
        { role: "user", content: "Hello" },
      ]);
      expect(transformPrompt([{ role: "user", content: "Hello" }])).toEqual([
        { role: "user", content: "Hello" },
      ]);
    });

    it("should transform useJson correctly", () => {
      const transformUseJson = xAiChatV1.mapBody.useJson.transform as (
        v: any
      ) => any;
      expect(transformUseJson(true)).toBe("json_object");
      expect(transformUseJson(false)).toBe("text");
    });
  });

  describe("xai.grok-4-1-fast", () => {
    const config = xai["xai.grok-4-1-fast"] as Config;

    it("should have the correct default model", () => {
      expect(config.options.model.default).toBe("grok-4-1-fast-non-reasoning");
    });

    it("should have the correct key, provider, endpoint, and method", () => {
      expect(config.key).toBe("xai.chat.v1");
      expect(config.provider).toBe("xai.chat");
      expect(config.endpoint).toBe("https://api.x.ai/v1/chat/completions");
      expect(config.method).toBe("POST");
    });
  });

  describe("effort transform", () => {
    // Per xAI docs (checked 2026-05-13), reasoning_effort is only supported
    // on grok-4.3 and grok-4.20-multi-agent. grok-4 specifically returns an
    // error if reasoning_effort is sent. Since none of those models have
    // shorthands here yet, effort must be dropped for every model we ship.
    const transform = xai["xai.chat.v1"].mapBody.effort.transform as (
      v: any,
      s: any
    ) => any;

    it("drops effort for every currently-shipped xAI shorthand model", () => {
      for (const model of [
        "grok-2-latest",
        "grok-3",
        "grok-3-mini",
        "grok-4",
        "grok-4-fast-non-reasoning",
        "grok-4-1-fast-non-reasoning",
      ]) {
        expect(transform("low", { model })).toBeUndefined();
        expect(transform("high", { model })).toBeUndefined();
      }
    });
  });
});
