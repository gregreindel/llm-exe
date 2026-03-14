import { openai } from "@/llm/config/openai";
import { Config } from "@/types";

describe("openai configuration", () => {
  const openAiChatV1 = openai["openai.chat.v1"] as Config;
  const openAiChatMockV1 = openai["openai.chat-mock.v1"] as Config;
  const openAiGpt4o = openai["openai.gpt-4o"] as Config;
  const openAiGpt53 = openai["openai.gpt-5.3"] as Config;
  const openAiGpt54 = openai["openai.gpt-5.4"] as Config;
  const openAiO3Pro = openai["openai.o3-pro"] as Config;

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

  describe("openai.chat.v1 effort transform", () => {
    const effortTransform = openAiChatV1.mapBody.effort.transform as (
      v: any,
      s: any
    ) => any;

    it("should return the value for supported model and valid effort", () => {
      expect(effortTransform("low", { model: "gpt-5" })).toBe("low");
      expect(effortTransform("medium", { model: "gpt-5" })).toBe("medium");
      expect(effortTransform("high", { model: "gpt-5" })).toBe("high");
      expect(effortTransform("minimal", { model: "gpt-5" })).toBe("minimal");
    });

    it("should return undefined for unsupported model", () => {
      expect(effortTransform("high", { model: "gpt-4o" })).toBe(undefined);
    });

    it("should return undefined for non-string value", () => {
      expect(effortTransform(123, { model: "gpt-5" })).toBe(undefined);
    });

    it("should return undefined for unsupported effort level", () => {
      expect(effortTransform("max", { model: "gpt-5" })).toBe(undefined);
    });
  });

  describe("openai.chat.v1 mapOptions", () => {
    it("should transform functionCall 'any' to 'required'", () => {
      const result = openAiChatV1.mapOptions!.functionCall!("any", {});
      expect(result).toEqual({ tool_choice: "required" });
    });

    it("should transform functionCall 'none'", () => {
      const result = openAiChatV1.mapOptions!.functionCall!("none", {});
      expect(result).toEqual({ tool_choice: "none" });
    });

    it("should transform functionCall 'auto'", () => {
      const result = openAiChatV1.mapOptions!.functionCall!("auto", {});
      expect(result).toEqual({ tool_choice: "auto" });
    });

    it("should pass through specific function call value", () => {
      const specific = { type: "function", function: { name: "my_fn" } };
      const result = openAiChatV1.mapOptions!.functionCall!(
        specific as any,
        {}
      );
      expect(result).toEqual({ tool_choice: specific });
    });

    it("should transform functions to openai tools format", () => {
      const functions = [
        {
          name: "calculate",
          description: "Do math",
          parameters: {
            type: "object",
            properties: { expr: { type: "string" } },
          },
        },
      ];
      const result = openAiChatV1.mapOptions!.functions!(functions, {});
      expect(result).toEqual({
        tools: [
          {
            type: "function",
            function: {
              name: "calculate",
              description: "Do math",
              parameters: expect.objectContaining({
                type: "object",
                properties: { expr: { type: "string" } },
              }),
              strict: false,
            },
          },
        ],
      });
    });

    it("should set strict to true when functionCallStrictInput is enabled", () => {
      const functions = [
        {
          name: "test",
          description: "Test",
          parameters: { type: "object", properties: {} },
        },
      ];
      const result = openAiChatV1.mapOptions!.functions!(functions, {
        functionCallStrictInput: true,
      });
      expect(result.tools[0].function.strict).toBe(true);
    });

    it("should transform jsonSchema correctly", () => {
      const schema = {
        type: "object",
        properties: { name: { type: "string" } },
      };
      const result = openAiChatV1.mapOptions!.jsonSchema!(schema, {}, {});
      expect(result).toEqual({
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "output",
            strict: false,
            schema: expect.objectContaining({
              type: "object",
              properties: { name: { type: "string" } },
            }),
          },
        },
      });
    });

    it("should merge with existing response_format in currentInput", () => {
      const schema = { type: "object", properties: {} };
      const currentInput = { response_format: { existing: true } };
      const result = openAiChatV1.mapOptions!.jsonSchema!(
        schema,
        {},
        currentInput
      );
      expect(result.response_format.existing).toBe(true);
      expect(result.response_format.type).toBe("json_schema");
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

  describe("openai.gpt-5.3", () => {
    it("should be based on openAiChatV1 configuration", () => {
      expect(openAiGpt53.endpoint).toEqual(openAiChatV1.endpoint);
      expect(openAiGpt53.method).toEqual(openAiChatV1.method);
      expect(openAiGpt53.headers).toEqual(openAiChatV1.headers);
    });

    it("should override model in mapBody and options as gpt-5.3", () => {
      expect(openAiGpt53.mapBody.model).toEqual({
        default: "gpt-5.3",
        key: "model",
      });
      expect(openAiGpt53.options.model).toEqual({ default: "gpt-5.3" });
    });
  });

  describe("openai.gpt-5.4", () => {
    it("should be based on openAiChatV1 configuration", () => {
      expect(openAiGpt54.endpoint).toEqual(openAiChatV1.endpoint);
      expect(openAiGpt54.method).toEqual(openAiChatV1.method);
      expect(openAiGpt54.headers).toEqual(openAiChatV1.headers);
    });

    it("should override model in mapBody and options as gpt-5.4", () => {
      expect(openAiGpt54.mapBody.model).toEqual({
        default: "gpt-5.4",
        key: "model",
      });
      expect(openAiGpt54.options.model).toEqual({ default: "gpt-5.4" });
    });
  });

  describe("openai.o3-pro", () => {
    it("should be based on openAiChatV1 configuration", () => {
      expect(openAiO3Pro.endpoint).toEqual(openAiChatV1.endpoint);
      expect(openAiO3Pro.method).toEqual(openAiChatV1.method);
      expect(openAiO3Pro.headers).toEqual(openAiChatV1.headers);
    });

    it("should override model in mapBody and options as o3-pro", () => {
      expect(openAiO3Pro.mapBody.model).toEqual({
        default: "o3-pro",
        key: "model",
      });
      expect(openAiO3Pro.options.model).toEqual({ default: "o3-pro" });
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
