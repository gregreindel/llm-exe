import { xai } from "@/llm/config/x";
import { Config } from "@/types";

describe("xai configuration", () => {
  const xAiChatV1 = xai["xai.chat.v1"] as Config;
  const xAiGrok41Fast = xai["xai.grok-4-1-fast"] as Config;

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
    it("should be based on xAiChatV1 configuration", () => {
      expect(xAiGrok41Fast.endpoint).toEqual(xAiChatV1.endpoint);
      expect(xAiGrok41Fast.method).toEqual(xAiChatV1.method);
      expect(xAiGrok41Fast.headers).toEqual(xAiChatV1.headers);
    });

    it("should override model in mapBody and options as grok-4-1-fast-non-reasoning", () => {
      expect(xAiGrok41Fast.mapBody.model).toEqual({
        default: "grok-4-1-fast-non-reasoning",
        key: "model",
      });
      expect(xAiGrok41Fast.options.model).toEqual({ default: "grok-4-1-fast-non-reasoning" });
    });
  });
});
