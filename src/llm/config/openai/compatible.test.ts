import { createOpenAiCompatibleConfiguration } from "./compatible";

jest.mock("@/utils/modules/getEnvironmentVariable", () => ({
  getEnvironmentVariable: jest.fn().mockReturnValue("test-api-key"),
}));

describe("createOpenAiCompatibleConfiguration", () => {
  const baseOverrides = {
    key: "custom.chat.v1",
    provider: "custom.chat",
    endpoint: "https://api.custom.com/v1/chat/completions",
    apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"] as [string, string],
  };

  it("should create a valid config with correct key, provider, endpoint, and method", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);

    expect(config.key).toBe("custom.chat.v1");
    expect(config.provider).toBe("custom.chat");
    expect(config.endpoint).toBe(
      "https://api.custom.com/v1/chat/completions"
    );
    expect(config.method).toBe("POST");
  });

  it("should set up headers with the mapped API key template", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);

    expect(config.headers).toBe(
      '{"Authorization":"Bearer {{customApiKey}}", "Content-Type": "application/json" }'
    );
  });

  it("should configure the API key option with default from environment", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);

    expect(config.options.customApiKey).toEqual({
      default: "test-api-key",
    });
  });

  it("should include standard options: prompt, effort, topP, useJson", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);

    expect(config.options).toHaveProperty("prompt");
    expect(config.options).toHaveProperty("effort");
    expect(config.options).toHaveProperty("topP");
    expect(config.options).toHaveProperty("useJson");
  });

  it("should map prompt to messages key", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);

    expect(config.mapBody.prompt.key).toBe("messages");
    expect(config.mapBody.prompt.transform).toBeInstanceOf(Function);
  });

  it("should map model to model key", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);

    expect(config.mapBody.model.key).toBe("model");
  });

  it("should map topP to top_p key", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);

    expect(config.mapBody.topP.key).toBe("top_p");
  });

  it("should transform useJson to response_format type", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);
    const transform = config.mapBody.useJson.transform as (v: any) => any;

    expect(transform(true)).toBe("json_object");
    expect(transform(false)).toBe("text");
  });

  it("should transform effort for supported models only", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);
    const transform = config.mapBody.effort.transform as (
      v: any,
      s: any
    ) => any;

    expect(transform("low", { model: "gpt-5" })).toBe("low");
    expect(transform("medium", { model: "gpt-5" })).toBe("medium");
    expect(transform("high", { model: "gpt-5" })).toBe("high");
    expect(transform("minimal", { model: "gpt-5" })).toBe("minimal");
  });

  it("should return undefined for effort with unsupported models", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);
    const transform = config.mapBody.effort.transform as (
      v: any,
      s: any
    ) => any;

    expect(transform("high", { model: "gpt-4o" })).toBeUndefined();
  });

  it("should return undefined for effort with non-string values", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);
    const transform = config.mapBody.effort.transform as (
      v: any,
      s: any
    ) => any;

    expect(transform(123, { model: "gpt-5" })).toBeUndefined();
  });

  it("should return undefined for unsupported effort levels", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);
    const transform = config.mapBody.effort.transform as (
      v: any,
      s: any
    ) => any;

    expect(transform("max", { model: "gpt-5" })).toBeUndefined();
  });

  describe("mapOptions", () => {
    it("should transform functionCall values correctly", () => {
      const config = createOpenAiCompatibleConfiguration(baseOverrides);
      const functionCall = config.mapOptions!.functionCall!;

      expect(functionCall("any", {})).toEqual({ tool_choice: "required" });
      expect(functionCall("none", {})).toEqual({ tool_choice: "none" });
      expect(functionCall("auto", {})).toEqual({ tool_choice: "auto" });
    });

    it("should pass through specific function call values", () => {
      const config = createOpenAiCompatibleConfiguration(baseOverrides);
      const functionCall = config.mapOptions!.functionCall!;
      const specific = { type: "function", function: { name: "my_fn" } };

      expect(functionCall(specific as any, {})).toEqual({
        tool_choice: specific,
      });
    });

    it("should transform functions to openai tools format", () => {
      const config = createOpenAiCompatibleConfiguration(baseOverrides);
      const functions = config.mapOptions!.functions!;

      const result = functions(
        [
          {
            name: "test_fn",
            description: "A test function",
            parameters: {
              type: "object",
              properties: { input: { type: "string" } },
            },
          },
        ],
        {}
      );

      expect(result.tools).toHaveLength(1);
      expect(result.tools[0].type).toBe("function");
      expect(result.tools[0].function.name).toBe("test_fn");
      expect(result.tools[0].function.description).toBe("A test function");
      expect(result.tools[0].function.strict).toBe(false);
    });

    it("should set strict on functions when functionCallStrictInput is true", () => {
      const config = createOpenAiCompatibleConfiguration(baseOverrides);
      const functions = config.mapOptions!.functions!;

      const result = functions(
        [
          {
            name: "test",
            description: "Test",
            parameters: { type: "object", properties: {} },
          },
        ],
        { functionCallStrictInput: true }
      );

      expect(result.tools[0].function.strict).toBe(true);
    });

    it("should transform jsonSchema correctly", () => {
      const config = createOpenAiCompatibleConfiguration(baseOverrides);
      const jsonSchema = config.mapOptions!.jsonSchema!;

      const schema = {
        type: "object",
        properties: { name: { type: "string" } },
      };
      const result = jsonSchema(schema, {}, {});

      expect(result.response_format.type).toBe("json_schema");
      expect(result.response_format.json_schema.name).toBe("output");
      expect(result.response_format.json_schema.strict).toBe(false);
    });

    it("should set strict on jsonSchema when functionCallStrictInput is true", () => {
      const config = createOpenAiCompatibleConfiguration(baseOverrides);
      const jsonSchema = config.mapOptions!.jsonSchema!;

      const result = jsonSchema(
        { type: "object", properties: {} },
        { functionCallStrictInput: true },
        {}
      );

      expect(result.response_format.json_schema.strict).toBe(true);
    });

    it("should merge with existing response_format in currentInput", () => {
      const config = createOpenAiCompatibleConfiguration(baseOverrides);
      const jsonSchema = config.mapOptions!.jsonSchema!;

      const currentInput = { response_format: { existing: true } };
      const result = jsonSchema(
        { type: "object", properties: {} },
        {},
        currentInput
      );

      expect(result.response_format.existing).toBe(true);
      expect(result.response_format.type).toBe("json_schema");
    });
  });

  it("should use default OutputOpenAIChat transformResponse when none provided", () => {
    const config = createOpenAiCompatibleConfiguration(baseOverrides);

    expect(config.transformResponse).toBeInstanceOf(Function);
  });

  it("should use custom transformResponse when provided", () => {
    const customTransform = jest.fn();
    const config = createOpenAiCompatibleConfiguration({
      ...baseOverrides,
      transformResponse: customTransform,
    });

    expect(config.transformResponse).toBe(customTransform);
  });
});
