import { xai } from "@/llm/config/x";
import { Config } from "@/types";

describe("openai configuration", () => {
  const xAiChatV1 = xai["xai.chat.v1"] as Config;

  describe("xai.chat.v1", () => {
    it("should have the correct key, provider, endpoint, and method", () => {
      expect(xAiChatV1.key).toBe("xai.chat.v1");
      expect(xAiChatV1.provider).toBe("xai.chat");
      expect(xAiChatV1.endpoint).toBe(
        "https://api.x.ai/v1/chat/completions"
      );
      expect(xAiChatV1.method).toBe("POST");
    });

    it("should have correct headers", () => {
      expect(xAiChatV1.headers).toBe(
        `{"Authorization":"Bearer {{xAiApiKey}}", "Content-Type": "application/json" }`
      );
    });

    it("should sanitize the prompt correctly", () => {
      const sanitizePrompt = xAiChatV1.mapBody.prompt.sanitize as (
        v: any
      ) => any;
      expect(sanitizePrompt("Hello")).toEqual([
        { role: "user", content: "Hello" },
      ]);
      expect(sanitizePrompt([{ role: "user", content: "Hello" }])).toEqual([
        { role: "user", content: "Hello" },
      ]);
    });

    it("should sanitize useJson correctly", () => {
      const sanitizeUseJson = xAiChatV1.mapBody.useJson.sanitize as (
        v: any
      ) => any;
      expect(sanitizeUseJson(true)).toBe("json_object");
      expect(sanitizeUseJson(false)).toBe("text");
    });
  });

});
