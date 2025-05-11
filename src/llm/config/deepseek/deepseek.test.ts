import { deepseek } from "@/llm/config/deepseek";
import { Config } from "@/types";

describe("deepseek configuration", () => {
  const deepseekChatV1 = deepseek["deepseek.chat.v1"] as Config;
  const deepseekChat = deepseek["deepseek.chat"] as Config;

  describe("deepseek.chat.v1", () => {
    it("should have the correct key, provider, endpoint, and method", () => {
      expect(deepseekChatV1.key).toBe("deepseek.chat.v1");
      expect(deepseekChatV1.provider).toBe("deepseek.chat");
      expect(deepseekChatV1.endpoint).toBe(
        "https://api.deepseek.com/v1/chat/completions"
      );
      expect(deepseekChatV1.method).toBe("POST");
    });

    it("should have correct headers", () => {
      expect(deepseekChatV1.headers).toBe(
        `{"Authorization":"Bearer {{deepseekApiKey}}", "Content-Type": "application/json" }`
      );
    });

    it("should sanitize the prompt correctly", () => {
      const sanitizePrompt = deepseekChatV1.mapBody.prompt.sanitize as (
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
      const sanitizeUseJson = deepseekChatV1.mapBody.useJson.sanitize as (
        v: any
      ) => any;
      expect(sanitizeUseJson(true)).toBe("json_object");
      expect(sanitizeUseJson(false)).toBe("text");
    });
  });

  describe("deepseek.deepseek-chat", () => {
    it("should be based on deepseekChatV1 configuration", () => {
      expect(deepseekChat.endpoint).toEqual(deepseekChatV1.endpoint);
      expect(deepseekChat.method).toEqual(deepseekChatV1.method);
      expect(deepseekChat.headers).toEqual(deepseekChatV1.headers);
    });

    it("should override model in mapBody and options as deepseek-chat", () => {
      expect(deepseekChat.mapBody.model).toEqual({
        default: "deepseek-chat",
        key: "model",
      });
      expect(deepseekChat.options.model).toEqual({ default: "deepseek-chat" });
    });
  });
});
