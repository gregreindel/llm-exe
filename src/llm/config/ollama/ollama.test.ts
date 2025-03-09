import { ollama } from "@/llm/config/ollama";
import { Config } from "@/types";

describe("ollama configuration", () => {
  const ollamaChatV1 = ollama["ollama.chat.v1"] as Config;

  describe("ollama.chat.v1", () => {
    it("should have the correct key, provider, endpoint, and method", () => {
      expect(ollamaChatV1.key).toBe("ollama.chat.v1");
      expect(ollamaChatV1.provider).toBe("ollama.chat");
      expect(ollamaChatV1.endpoint).toBe(
        "http://localhost:11434/api/chat"
      );
      expect(ollamaChatV1.method).toBe("POST");
    });

    it("should have correct headers", () => {
      expect(ollamaChatV1.headers).toBe(
        `{"Content-Type": "application/json" }`
      );
    });

    it("should sanitize the prompt correctly", () => {
      const sanitizePrompt = ollamaChatV1.mapBody.prompt.sanitize as (
        v: any
      ) => any;
      expect(sanitizePrompt("Hello")).toEqual([
        { role: "user", content: "Hello" },
      ]);
      expect(sanitizePrompt([{ role: "user", content: "Hello" }])).toEqual([
        { role: "user", content: "Hello" },
      ]);
    });
  });
});
