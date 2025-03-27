import { google } from "@/llm/config/google";
import { Config } from "@/types";

describe("google configuration", () => {
  const googleChatV1 = google["google.chat.v1"] as Config;
  const googleGemini2Flash = google["google.gemini-2.0-flash"] as Config;

  describe("google.chat.v1", () => {
    it("should have the correct key, provider, endpoint, and method", () => {
      expect(googleChatV1.key).toBe("google.chat.v1");
      expect(googleChatV1.provider).toBe("google.chat");
      expect(googleChatV1.endpoint).toBe(
        "https://generativelanguage.googleapis.com/v1beta/models/{{model}}:generateContent?key={{geminiApiKey}}"
      );
      expect(googleChatV1.method).toBe("POST");
    });

    it("should have correct headers", () => {
      expect(googleChatV1.headers).toBe(
        `{"Content-Type": "application/json" }`
      );
    });

    it("should sanitize the prompt correctly", () => {
      const sanitizePrompt = googleChatV1.mapBody.prompt.sanitize as (
        v: any
      ) => any;
      expect(sanitizePrompt("Hello")).toEqual("Hello");
      expect(sanitizePrompt([{ role: "user", content: "Hello" }])).toEqual([{"parts": [{"text": "Hello"}], "role": "user"}]);
    });
  });

  describe("gemini-2.0-flash", () => {
    it("should be based on googleChatV1 configuration", () => {
      expect(googleGemini2Flash.endpoint).toEqual(googleChatV1.endpoint);
      expect(googleGemini2Flash.method).toEqual(googleChatV1.method);
      expect(googleGemini2Flash.headers).toEqual(googleChatV1.headers);
    });

    it("should override model in mapBody and options as gemini-2.0-flash", () => {
      expect(googleGemini2Flash.mapBody.model).toEqual({
        default: "gemini-2.0-flash",
        key: "model",
      });
      expect(googleGemini2Flash.options.model).toEqual({ default: "gemini-2.0-flash" });
    });
  });
});
