import { openai } from "@/llm/config/openai";
import { Config } from "@/types";

describe("openai configuration", () => {
  const openAiChatV1 = openai["openai.chat.v1"] as Config;
  const openAiChatMockV1 = openai["openai.chat-mock.v1"] as Config;
  const openAiGpt4o = openai["openai.gpt-4o"] as Config;

  describe("openai.chat.v1", () => {
    it("should have the correct key, provider, endpoint, and method", () => {
      expect(openAiChatV1.key).toBe("openai.chat.v1");
      expect(openAiChatV1.provider).toBe("openai.chat");
      expect(openAiChatV1.endpoint).toBe(
        "https://api.openai.com/v1/chat/completions"
      );
      expect(openAiChatV1.method).toBe("POST");
    });

    it("should have correct headers", () => {
      expect(openAiChatV1.headers).toBe(
        `{"Authorization":"Bearer {{openAiApiKey}}", "Content-Type": "application/json" }`
      );
    });

    it("should transform the prompt correctly", () => {
      const transformPrompt = openAiChatV1.mapBody.prompt.transform as (
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
      const transformUseJson = openAiChatV1.mapBody.useJson.transform as (
        v: any
      ) => any;
      expect(transformUseJson(true)).toBe("json_object");
      expect(transformUseJson(false)).toBe("text");
    });
  });

  describe("openai.chat-mock.v1", () => {
    it("should have the correct key, provider, endpoint, and method", () => {
      expect(openAiChatMockV1.key).toBe("openai.chat-mock.v1");
      expect(openAiChatMockV1.provider).toBe("openai.chat-mock");
      expect(openAiChatMockV1.endpoint).toBe("http://localhost");
      expect(openAiChatMockV1.method).toBe("POST");
    });

    it("should have correct headers", () => {
      expect(openAiChatMockV1.headers).toBe(
        `{"Authorization":"Bearer {{openAiApiKey}}", "Content-Type": "application/json" }`
      );
    });

    it("should transform useJson correctly", () => {
      const transformUseJson = openAiChatMockV1.mapBody.useJson.transform as (
        v: any
      ) => any;
      expect(transformUseJson(true)).toBe("json_object");
      expect(transformUseJson(false)).toBe("text");
    });
  });

  describe("openai.gpt-4o", () => {
    it("should be based on openAiChatV1 configuration", () => {
      expect(openAiGpt4o.endpoint).toEqual(openAiChatV1.endpoint);
      expect(openAiGpt4o.method).toEqual(openAiChatV1.method);
      expect(openAiGpt4o.headers).toEqual(openAiChatV1.headers);
    });

    it("should override model in mapBody and options as gpt-4o", () => {
      expect(openAiGpt4o.mapBody.model).toEqual({
        default: "gpt-4o",
        key: "model",
      });
      expect(openAiGpt4o.options.model).toEqual({ default: "gpt-4o" });
    });
  });
});
