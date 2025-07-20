import { formatForProvider } from "./formatForProvider";
import { IChatMessages } from "@/types";

describe("formatForProvider", () => {
  describe("OpenAI provider", () => {
    it("formats string message", () => {
      const result = formatForProvider("openai", "Hello");
      expect(result).toEqual({
        messages: [{ role: "user", content: "Hello" }],
        response_format: { type: "text" }, // Default from OpenAI config
      });
    });

    it("formats chat messages", () => {
      const messages: IChatMessages = [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hello" },
      ];
      const result = formatForProvider("openai", messages);
      expect(result).toEqual({
        messages: messages,
        response_format: { type: "text" }, // Default from OpenAI config
      });
    });

    it("includes useJson transformation", () => {
      const result = formatForProvider("openai", "Test", { useJson: true });
      expect(result).toEqual({
        messages: [{ role: "user", content: "Test" }],
        response_format: { type: "json_object" },
      });
    });

    it("includes model and topP", () => {
      const result = formatForProvider("openai", "Test", {
        model: "gpt-4",
        topP: 0.9,
      });
      expect(result).toEqual({
        messages: [{ role: "user", content: "Test" }],
        model: "gpt-4",
        top_p: 0.9,
        response_format: { type: "text" }, // Default from OpenAI config
      });
    });

    it("formats functions with strict mode", () => {
      const result = formatForProvider("openai", "Test", {
        functions: [
          {
            name: "search",
            description: "Search the web",
            parameters: { type: "object", properties: {} },
          },
        ],
        functionCallStrictInput: true,
      });

      expect(result.tools).toEqual([
        {
          type: "function",
          function: {
            name: "search",
            description: "Search the web",
            parameters: { type: "object", properties: {} },
            strict: true,
          },
        },
      ]);
    });

    it("formats jsonSchema with strict mode", () => {
      const result = formatForProvider("openai", "Test", {
        jsonSchema: {
          type: "object",
          properties: { name: { type: "string" } },
        },
        functionCallStrictInput: true,
      });

      expect(result.response_format).toEqual({
        type: "json_schema",
        json_schema: {
          name: "output",
          strict: true,
          schema: {
            type: "object",
            properties: { name: { type: "string" } },
          },
        },
      });
    });

    it("handles functionCall", () => {
      const result = formatForProvider("openai", "Test", {
        functionCall: "auto",
        functions: [{ name: "test", description: "test", parameters: {} }],
      });

      expect(result.tool_choice).toBe("auto");
    });

    it("removes functions when functionCall is none", () => {
      const result = formatForProvider("openai", "Test", {
        functionCall: "none",
        functions: [{ name: "test", description: "test", parameters: {} }],
      });

      expect(result.tool_choice).toBe("none");
      expect(result.tools).toBeUndefined();
    });
  });

  describe("Anthropic provider", () => {
    it("extracts system message", () => {
      const messages: IChatMessages = [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hello" },
      ];

      const result = formatForProvider("anthropic", messages);
      expect(result).toEqual({
        system: "You are helpful",
        messages: [{ role: "user", content: "Hello" }],
        // Note: max_tokens is mapped but may not have a default in the output
      });
    });

    it("formats functions", () => {
      const result = formatForProvider("anthropic", "Test", {
        functions: [
          {
            name: "search",
            description: "Search the web",
            parameters: {
              type: "object",
              properties: { query: { type: "string" } },
            },
          },
        ],
      });

      expect(result.tools).toEqual([
        {
          name: "search",
          description: "Search the web",
          input_schema: {
            type: "object",
            properties: { query: { type: "string" } },
          },
        },
      ]);
    });

    it("handles functionCall", () => {
      const result = formatForProvider("anthropic", "Test", {
        functionCall: "auto",
        functions: [{ name: "test", description: "test", parameters: {} }],
      });

      expect(result.tool_choice).toEqual({ type: "auto" });
    });

    it("removes functions when functionCall is none", () => {
      const result = formatForProvider("anthropic", "Test", {
        functionCall: "none",
        functions: [{ name: "test", description: "test", parameters: {} }],
      });

      expect(result.tool_choice).toBeUndefined();
      expect(result.tools).toBeUndefined();
    });
  });

  describe("DeepSeek provider", () => {
    it("uses OpenAI sanitizers", () => {
      const result = formatForProvider("deepseek", "Hello", { useJson: true });
      expect(result).toEqual({
        messages: [{ role: "user", content: "Hello" }],
        response_format: { type: "json_object" },
      });
    });
  });

  describe("X provider", () => {
    it("uses OpenAI sanitizers", () => {
      const result = formatForProvider("x", "Hello", { useJson: true });
      expect(result).toEqual({
        messages: [{ role: "user", content: "Hello" }],
        response_format: { type: "json_object" },
      });
    });
  });

  describe("Ollama provider", () => {
    it("formats messages with model", () => {
      const result = formatForProvider("ollama", "Hello", { model: "llama2" });
      expect(result).toEqual({
        messages: [{ role: "user", content: "Hello" }],
        model: "llama2",
      });
    });
  });

  describe("Amazon Meta provider", () => {
    it("formats messages correctly", () => {
      const messages: IChatMessages = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
        { role: "user", content: "How are you?" },
      ];

      const result = formatForProvider("amazon:meta", messages);
      expect(result).toEqual({
        prompt: "\nUser: Hello\nAssistant: Hi\nUser: How are you?\n",
        max_gen_len: 2048, // Default from config
      });
    });
  });

  describe("Error handling", () => {
    it("throws for unknown provider", () => {
      // Type assertion needed to test runtime behavior with invalid input
      expect(() => formatForProvider("unknown" as any, "Test")).toThrow(
        "Unknown provider: unknown"
      );
    });
  });
});
