import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getOutputParser } from "@/llm/output";
import {
  GenericLLm,
  IChatMessages,
  LlmProvider,
  LlmProviderKey,
  OpenAiLlmExecutorOptions,
} from "@/types";
import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import { parseHeaders } from "@/llm/_utils.parseHeaders";
import { useLlm_call } from "@/llm/llm.call";
// import { normalizeFunctionCall } from "@/llm/output/_util";

jest.mock("@/utils/modules/request", () => ({
  apiRequest: jest.fn(),
}));

jest.mock("@/utils/modules/replaceTemplateStringSimple", () => ({
  replaceTemplateStringSimple: jest.fn(),
}));

jest.mock("@/llm/_utils.mapBody", () => ({
  mapBody: jest.fn(),
}));

jest.mock("@/llm/_utils.parseHeaders", () => ({
  parseHeaders: jest.fn(),
}));

jest.mock("@/llm/output", () => ({
  getOutputParser: jest.fn(),
}));

// jest.mock("@/llm/output/_util", () => ({
//   normalizeFunctionCall: jest.fn(),
// }));

jest.mock("@/llm/config", () => ({
  getLlmConfig: jest.fn(),
}));

// jest.mock("@/llm/config");

describe("useLlm_call", () => {
  const getLlmConfigMock = getLlmConfig as jest.Mock;
  const replaceTemplateStringSimpleMock =
    replaceTemplateStringSimple as jest.Mock;
  const mapBodyMock = mapBody as jest.Mock;
  const parseHeadersMock = parseHeaders as jest.Mock;
  const apiRequestMock = apiRequest as jest.Mock;
  const getOutputParserMock = getOutputParser as jest.Mock;
  // const normalizeFunctionCallMock = normalizeFunctionCall as jest.Mock;

  const mockState = {
    key: "openai.chat-mock.v1",
    provider: "openai.chat-mock",
  } as unknown as GenericLLm & {
    key: LlmProviderKey;
    provider: LlmProvider;
  };

  const mockStateAnthropic = {
    key: "anthropic.chat.v1",
    provider: "anthropic.chat",
  } as unknown as GenericLLm & {
    key: LlmProviderKey;
    provider: LlmProvider;
  };

  const mockStateOpenAi = {
    key: "openai.chat.v1",
    provider: "openai.chat",
  } as unknown as GenericLLm & {
    key: LlmProviderKey;
    provider: LlmProvider;
  };



  const mockMessages = [
    {
      role: "user",
      content: "Hello",
    },
  ] as IChatMessages;
  const mockOptions = {} as OpenAiLlmExecutorOptions;
  const mockConfig = {
    endpoint: "http://api.test/endpoint",
    mapBody: jest.fn(),
    method: "POST",
    provider: "openai.chat",
    key: "openai.chat.v1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    getLlmConfigMock.mockReturnValue(mockConfig);
    replaceTemplateStringSimpleMock.mockReturnValue("http://api.test/endpoint");
    mapBodyMock.mockReturnValue({
      prompt: mockMessages,
    });
    parseHeadersMock.mockResolvedValue({
      "Content-Type": "application/json",
    });
    apiRequestMock.mockResolvedValueOnce({
      data: "response",
    });
  });

  it("should call all necessary functions and return parsed output", async () => {
    getOutputParserMock.mockReturnValueOnce("parsedOutput");

    const result = await useLlm_call(mockState, mockMessages, mockOptions);

    expect(getLlmConfig).toHaveBeenCalledWith(mockState.key);
    expect(mapBody).toHaveBeenCalledWith(mockConfig.mapBody, {
      ...mockState,
      prompt: mockMessages,
    });
    expect(replaceTemplateStringSimple).toHaveBeenCalledWith(
      mockConfig.endpoint,
      mockState
    );
    expect(parseHeaders).toHaveBeenCalledWith(
      mockConfig,
      mockState,
      expect.objectContaining({
        url: "http://api.test/endpoint",
        body: JSON.stringify({
          prompt: mockMessages,
        }),
      })
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      "http://api.test/endpoint",
      expect.objectContaining({
        method: mockConfig.method,
        body: JSON.stringify({
          prompt: mockMessages,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
    expect(getOutputParser).toHaveBeenCalledWith(
      { key: mockState.key, provider: mockState.provider },
      {
        data: "response",
      }
    );

    expect(result).toBe("parsedOutput");
  });

  it("should handle an error in apiRequest", async () => {
    parseHeadersMock.mockImplementationOnce(() => {
      throw new Error("API Request Failed");
    });

    await expect(
      useLlm_call(mockState, mockMessages, mockOptions)
    ).rejects.toThrow("API Request Failed");
  });

  it("should anthropic and function_call is none, remove functions", async () => {

    const mock_options = {
      function_call: "none",
      functions: [{ name: "something", description: "", parameters: {} }],
    };
    await useLlm_call(mockStateAnthropic, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith(
      "http://api.test/endpoint",
      expect.objectContaining({
        method: mockConfig.method,
        body: JSON.stringify({
          prompt: mockMessages,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("should anthropic and function_call is none, remove functions", async () => {
    const mock_options = {
      function_call: "auto",
      functions: [{ name: "something", description: "", parameters: {} }],
    };
    await useLlm_call(mockStateAnthropic, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        tool_choice: { type: mock_options.function_call },
        tools: mock_options.functions.map((a) => ({
          name: a.name,
          description: a.description,
          input_schema: a.parameters,
        })),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });


  it("should anthropic and function_call is none, remove functions", async () => {
    const mock_options = {
      function_call: "any",
      functions: [{ name: "something", description: "", parameters: {} }],
    };
    await useLlm_call(mockStateAnthropic, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        tool_choice: { type: mock_options.function_call },
        tools: mock_options.functions.map((a) => ({
          name: a.name,
          description: a.description,
          input_schema: a.parameters,
        })),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });


  it("should anthropic and function_call is none, remove functions", async () => {
    const mock_options = {
      function_call: { name: "something"},
      functions: [{ name: "something", description: "", parameters: {} }],
    };
    await useLlm_call(mockStateAnthropic, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        tool_choice: mock_options.function_call,
        tools: mock_options.functions.map((a) => ({
          name: a.name,
          description: a.description,
          input_schema: a.parameters,
        })),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });



  it("should openai and function_call is none, remove functions", async () => {
    const mock_options = {
      function_call: "any",
      functions: [{ name: "something", description: "", parameters: {} }],
    };
    await useLlm_call(mockStateOpenAi, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        tool_choice: "required",
        tools: mock_options.functions.map((a) => ({
          type: "function",
          function: {
            name: a.name,
            description: a.description,
            parameters: a.parameters,
          }
        })),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should openai and response_format ", async () => {
    
    const mock_options = {
      json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["age", "name"],
        additionalProperties: false,
      }
    };


    await useLlm_call(mockStateOpenAi, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        response_format: {
          type: "json_schema",
          json_schema: {
            strict: true,
            name: "output",
            schema: mock_options.json_schema
          },
        }
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
});
