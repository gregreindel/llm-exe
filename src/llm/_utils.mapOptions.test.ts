import { mapOptions } from "./_utils.mapOptions";
import { Config } from "@/interfaces";

function makeBaseConfig(overrides: Partial<Config> = {}): Config {
  return {
    key: "openai.chat.v1" as any,
    provider: "openai.chat",
    method: "POST",
    endpoint: "https://example.com",
    headers: "{}",
    options: {},
    mapBody: {},
    transformResponse: (r: any) => r,
    ...overrides,
  };
}

describe("mapOptions", () => {
  it("should return input unchanged when config has no mapOptions", () => {
    const input = { model: "gpt-4", messages: [] };
    const config = makeBaseConfig();
    const result = mapOptions(input, { functions: [] }, config);
    expect(result).toEqual(input);
  });

  it("should return input unchanged when options is undefined", () => {
    const input = { model: "gpt-4" };
    const config = makeBaseConfig({
      mapOptions: {
        functions: jest.fn(),
      },
    });
    const result = mapOptions(input, undefined, config);
    expect(result).toEqual(input);
  });

  it("should apply functionCall mapping", () => {
    const config = makeBaseConfig({
      mapOptions: {
        functionCall: jest.fn().mockReturnValue({ tool_choice: "auto" }),
      },
    });
    const input = { model: "gpt-4" };
    const options = { functionCall: "auto", functions: [] };

    const result = mapOptions(input, options, config);
    expect(result).toEqual({ model: "gpt-4", tool_choice: "auto" });
    expect(config.mapOptions!.functionCall).toHaveBeenCalledWith(
      "auto",
      options,
      input,
      config
    );
  });

  it("should apply functions mapping", () => {
    const funcs = [{ name: "get_weather", description: "Get weather", parameters: {} }];
    const config = makeBaseConfig({
      mapOptions: {
        functions: jest.fn().mockReturnValue({ tools: funcs }),
      },
    });
    const input = { model: "gpt-4" };
    const options = { functions: funcs };

    const result = mapOptions(input, options, config);
    expect(result).toEqual({ model: "gpt-4", tools: funcs });
  });

  it("should not apply functions mapping when functions array is empty", () => {
    const config = makeBaseConfig({
      mapOptions: {
        functions: jest.fn(),
      },
    });
    const input = { model: "gpt-4" };
    const options = { functions: [] };

    const result = mapOptions(input, options, config);
    expect(result).toEqual({ model: "gpt-4" });
    expect(config.mapOptions!.functions).not.toHaveBeenCalled();
  });

  it("should apply jsonSchema mapping", () => {
    const schema = { type: "object", properties: { name: { type: "string" } } };
    const config = makeBaseConfig({
      mapOptions: {
        jsonSchema: jest.fn().mockReturnValue({
          response_format: { type: "json_schema", json_schema: schema },
        }),
      },
    });
    const input = { model: "gpt-4" };
    const options = { jsonSchema: schema, functions: [] };

    const result = mapOptions(input, options, config);
    expect(result).toEqual({
      model: "gpt-4",
      response_format: { type: "json_schema", json_schema: schema },
    });
  });

  it("should apply all mappings when all are present", () => {
    const config = makeBaseConfig({
      mapOptions: {
        functionCall: jest.fn().mockReturnValue({ tool_choice: "auto" }),
        functions: jest.fn().mockReturnValue({ tools: [{ name: "fn1" }] }),
        jsonSchema: jest.fn().mockReturnValue({ response_format: "json" }),
      },
    });
    const input = { model: "gpt-4" };
    const options = {
      functionCall: "auto",
      functions: [{ name: "fn1", description: "Function 1" }],
      jsonSchema: { type: "object" },
    };

    const result = mapOptions(input, options, config);
    expect(result).toEqual({
      model: "gpt-4",
      tool_choice: "auto",
      tools: [{ name: "fn1" }],
      response_format: "json",
    });
  });

  it("should handle _clearFunctions in functionCall mapping", () => {
    const config = makeBaseConfig({
      mapOptions: {
        functionCall: jest.fn().mockReturnValue({
          _clearFunctions: true,
          tool_choice: "none",
        }),
        functions: jest.fn(),
      },
    });
    const input = { model: "gpt-4" };
    const options = {
      functionCall: "none",
      functions: [{ name: "fn1", description: "Function 1" }],
    };

    const result = mapOptions(input, options, config);
    // _clearFunctions should cause functions mapping to be skipped (empty array)
    expect(result).toEqual({ model: "gpt-4", tool_choice: "none" });
    expect(config.mapOptions!.functions).not.toHaveBeenCalled();
    // _clearFunctions should not appear in result
    expect(result).not.toHaveProperty("_clearFunctions");
  });

  it("should not call functionCall mapper when no functionCall option", () => {
    const config = makeBaseConfig({
      mapOptions: {
        functionCall: jest.fn(),
      },
    });
    const input = { model: "gpt-4" };
    const options = { functions: [] };

    mapOptions(input, options, config);
    expect(config.mapOptions!.functionCall).not.toHaveBeenCalled();
  });

  it("should not call jsonSchema mapper when no jsonSchema option", () => {
    const config = makeBaseConfig({
      mapOptions: {
        jsonSchema: jest.fn(),
      },
    });
    const input = { model: "gpt-4" };
    const options = { functions: [] };

    mapOptions(input, options, config);
    expect(config.mapOptions!.jsonSchema).not.toHaveBeenCalled();
  });
});
