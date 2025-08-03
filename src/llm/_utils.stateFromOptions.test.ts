import { get } from "@/utils/modules/get";
import { pick } from "@/utils/modules/pick";
import { Config, GenericLLm, LlmProvider } from "@/types";
import { stateFromOptions } from "@/llm/_utils.stateFromOptions";

describe("stateFromOptions", () => {
  const mockGet = jest.fn(get);
  const mockPick = jest.fn(pick);
  
  jest.mock("@/utils/modules/pick", () => ({
    pick: mockPick,
  }));

  jest.mock("@/utils/modules/get", () => ({
    get: mockGet,
  }));

  const options: Partial<GenericLLm> = { model: "gpt-3", };
  const config: Config = {
    key: "openai.chat.v1" ,
    provider: "openai.chat" ,
    options: {
      temperature: { default: 0.7, required: [true] },
      maxTokens: { required: [true, "Error: [maxTokens] is required"] },
    },
    headers: '{"Authorization": "Bearer {{token}}"}',
    endpoint: "", 
    mapBody: {},
    method: 'POST',
    output: () => ({ id: '', name: '', created: 0, content: [], usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 }, stopReason: 'stop' }),
  };

  beforeEach(() => {
    mockGet.mockClear();
    mockPick.mockClear();
  });

  it("should return state with picked options, provider, and model", () => {
    const optionsWithMaxTokens: Partial<GenericLLm> = {
        model: "gpt-3",
        maxTokens: 100,
      };

    mockPick.mockReturnValueOnce(optionsWithMaxTokens);
    mockGet.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);

    const state = stateFromOptions(optionsWithMaxTokens, config);

    expect(state).toEqual({
      model: "gpt-3",
      key: "openai.chat.v1",
      provider: "openai.chat",
      temperature: 0.7,
      maxTokens: 100
    });
  });

  it("should throw error if any required config is missing", () => {
    mockPick.mockReturnValueOnce({ model: "gpt-3" });
    mockGet.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);

    expect(() => stateFromOptions(options, config)).toThrowError(
      "Error: [maxTokens] is required"
    );
  });

  it("should not throw error if required config is provided", () => {
    const optionsWithMaxTokens: Partial<GenericLLm> = {
      model: "gpt-3",
      maxTokens: 100,
    };
    mockPick.mockReturnValueOnce({ model: "gpt-3", maxTokens: 100 });
    mockGet.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);

    expect(() => stateFromOptions(optionsWithMaxTokens, config)).not.toThrow();
  });

  it("should handle undefined default values correctly", () => {
    const configWithoutDefaults = {
      provider: "openai" as LlmProvider,
      options: {
        maxTokens: { required: [true, "Field is required"] },
      },
    } as unknown as Config

    mockPick.mockReturnValueOnce({ model: "gpt-3" });
    mockGet.mockReturnValueOnce(undefined);

    expect(() => stateFromOptions(options, configWithoutDefaults)).toThrowError(
      "Field is required"
    );
  });

  it("should not set value if default is not provided and property is not required", () => {
    const optionalConfig: Config = {
      key: "openai.chat.v1" ,
      provider: "openai.chat",
      options: {
        optionalField: { required: [false] },
      },
      headers: '{"Authorization": "Bearer {{token}}"}',
      endpoint: "", 
      mapBody: {},
      method: 'POST',
      output: () => ({ id: '', name: '', created: 0, content: [], usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 }, stopReason: 'stop' }),
    };

    mockPick.mockReturnValueOnce({ model: "gpt-3" });
    mockGet.mockReturnValueOnce(undefined);

    const state = stateFromOptions(options, optionalConfig);

    expect(state).toEqual({
      model: "gpt-3",
      key: "openai.chat.v1",
      provider: "openai.chat",
    });
  });
});