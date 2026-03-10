import { createOpenAiCompatibleConfiguration } from "./compatible";

jest.mock("@/utils/modules/getEnvironmentVariable", () => ({
  getEnvironmentVariable: jest.fn((key: string) => `mock-${key}`),
}));

describe("createOpenAiCompatibleConfiguration", () => {
  it("should create a config with the correct key and provider", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    expect(config.key).toBe("custom.chat.v1");
    expect(config.provider).toBe("custom.chat");
    expect(config.endpoint).toBe("https://api.custom.com/v1/chat");
    expect(config.method).toBe("POST");
  });

  it("should set the API key option from environment variable", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    expect(config.options.customApiKey).toEqual({
      default: "mock-CUSTOM_API_KEY",
    });
  });

  it("should include standard options", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    expect(config.options).toHaveProperty("prompt");
    expect(config.options).toHaveProperty("effort");
    expect(config.options).toHaveProperty("topP");
    expect(config.options).toHaveProperty("useJson");
  });

  it("should set authorization header with correct API key placeholder", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["myKey", "MY_KEY_ENV"],
    });

    expect(config.headers).toContain("{{myKey}}");
    expect(config.headers).toContain("Bearer");
  });

  it("should map body fields correctly", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    expect(config.mapBody.prompt).toEqual({
      key: "messages",
      transform: expect.any(Function),
    });
    expect(config.mapBody.model).toEqual({ key: "model" });
    expect(config.mapBody.topP).toEqual({ key: "top_p" });
  });

  it("should transform useJson to response_format type", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    const transform = config.mapBody.useJson!.transform!;
    expect(transform(true, {} as any, {} as any)).toBe("json_object");
    expect(transform(false, {} as any, {} as any)).toBe("text");
  });

  it("should handle effort transform for supported models", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    const transform = config.mapBody.effort!.transform!;
    // gpt-5 is supported
    expect(transform("medium", { model: "gpt-5" } as any, {} as any)).toBe("medium");
    expect(transform("high", { model: "gpt-5" } as any, {} as any)).toBe("high");
    // unsupported model returns undefined
    expect(transform("medium", { model: "gpt-4o" } as any, {} as any)).toBeUndefined();
    // invalid effort value returns undefined
    expect(transform("invalid", { model: "gpt-5" } as any, {} as any)).toBeUndefined();
  });

  it("should use custom transformResponse when provided", () => {
    const customTransform = jest.fn();
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
      transformResponse: customTransform,
    });

    expect(config.transformResponse).toBe(customTransform);
  });

  it("should use default transformResponse when not provided", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    expect(config.transformResponse).toEqual(expect.any(Function));
  });

  it("should have mapOptions for functionCall", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    const functionCall = config.mapOptions!.functionCall!;
    expect(functionCall("any")).toEqual({ tool_choice: "required" });
    expect(functionCall("none")).toEqual({ tool_choice: "none" });
    expect(functionCall("auto")).toEqual({ tool_choice: "auto" });
    expect(functionCall("specific_fn")).toEqual({ tool_choice: "specific_fn" });
  });

  it("should have mapOptions for functions", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    const functions = config.mapOptions!.functions!;
    const result = functions(
      [
        {
          name: "test_fn",
          description: "A test function",
          parameters: { type: "object", properties: {} },
        },
      ],
      {}
    );

    expect(result).toEqual({
      tools: [
        {
          type: "function",
          function: {
            name: "test_fn",
            description: "A test function",
            parameters: expect.any(Object),
            strict: false,
          },
        },
      ],
    });
  });

  it("should set strict to true when functionCallStrictInput is true", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    const functions = config.mapOptions!.functions!;
    const result = functions(
      [
        {
          name: "test_fn",
          description: "A test",
          parameters: { type: "object", properties: {} },
        },
      ],
      { functionCallStrictInput: true }
    );

    expect(result.tools[0].function.strict).toBe(true);
  });

  it("should have mapOptions for jsonSchema", () => {
    const config = createOpenAiCompatibleConfiguration({
      key: "custom.chat.v1",
      provider: "custom.chat",
      endpoint: "https://api.custom.com/v1/chat",
      apiKeyMapping: ["customApiKey", "CUSTOM_API_KEY"],
    });

    const jsonSchema = config.mapOptions!.jsonSchema!;
    const result = jsonSchema(
      { type: "object", properties: { name: { type: "string" } } },
      {},
      {}
    );

    expect(result).toEqual({
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "output",
          strict: false,
          schema: expect.any(Object),
        },
      },
    });
  });
});
