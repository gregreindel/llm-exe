import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getOutputParser } from "@/llm/output";
import {
  GenericLLm,
  IChatMessages,
  LlmProvider,
  LlmProviderKey,
  LlmExecutorWithFunctionsOptions,
  GenericFunctionCall,
} from "@/types";
import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import { parseHeaders } from "@/llm/_utils.parseHeaders";
import { useLlm_call } from "@/llm/llm.call";
import { cleanJsonSchemaFor } from "./output/_utils/cleanJsonSchemaFor";

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

jest.mock("@/llm/config", () => ({
  getLlmConfig: jest.fn(),
}));

describe("useLlm_call", () => {
  const getLlmConfigMock = getLlmConfig as jest.Mock;
  const replaceTemplateStringSimpleMock =
    replaceTemplateStringSimple as jest.Mock;
  const mapBodyMock = mapBody as jest.Mock;
  const parseHeadersMock = parseHeaders as jest.Mock;
  const apiRequestMock = apiRequest as jest.Mock;
  const getOutputParserMock = getOutputParser as jest.Mock;

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
  const mockOptions = {} as LlmExecutorWithFunctionsOptions;
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

  it("should anthropic and functionCall is none, remove functions", async () => {
    const mock_options = {
      functionCall: "none",
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

  it("should anthropic and functionCall is none, remove functions", async () => {
    const mock_options = {
      functionCall: "auto" as GenericFunctionCall,
      functions: [{ name: "something", description: "", parameters: {} }],
    };
    await useLlm_call(mockStateAnthropic, mockMessages, mock_options);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        tool_choice: { type: mock_options.functionCall },
        tools: mock_options.functions.map((a) => ({
          name: a.name,
          description: a.description,
          input_schema: cleanJsonSchemaFor(
            a.parameters,
            mockStateAnthropic.provider
          ),
        })),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should anthropic and functionCall is none, remove functions", async () => {
    const mock_options = {
      functionCall: "any" as GenericFunctionCall,
      functions: [{ name: "something", description: "", parameters: {} }],
    };
    await useLlm_call(mockStateAnthropic, mockMessages, mock_options);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        tool_choice: { type: mock_options.functionCall },
        tools: mock_options.functions.map((a) => ({
          name: a.name,
          description: a.description,
          input_schema: cleanJsonSchemaFor(
            a.parameters,
            mockStateAnthropic.provider
          ),
        })),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should anthropic and functionCall is none, remove functions", async () => {
    const mock_options = {
      functionCall: { name: "something" },
      functions: [{ name: "something", description: "", parameters: {} }],
    };
    await useLlm_call(mockStateAnthropic, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        tool_choice: mock_options.functionCall,
        tools: mock_options.functions.map((a) => ({
          name: a.name,
          description: a.description,
          input_schema: cleanJsonSchemaFor(
            a.parameters,
            mockStateAnthropic.provider
          ),
        })),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should openai and functionCall is none, remove functions", async () => {
    const mock_options = {
      functionCall: "any" as GenericFunctionCall,
      functions: [{ name: "something", description: "", parameters: {} }],
    };
    await useLlm_call(mockStateOpenAi, mockMessages, mock_options);
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
            parameters: cleanJsonSchemaFor(
              a.parameters,
              mockStateOpenAi.provider
            ),
            strict: false,
          },
        })),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should openai and response_format ", async () => {
    const mock_options = {
      jsonSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["age", "name"],
        additionalProperties: false,
      },
    };

    await useLlm_call(mockStateOpenAi, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "output",
            strict: false,
            schema: mock_options.jsonSchema,
          },
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should openai and response_format with no options passed", async () => {
    await useLlm_call(mockStateOpenAi, mockMessages, undefined as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        response_format: undefined,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should openai and response_format with functionCallStrictInput", async () => {
    const mock_options = {
      functionCallStrictInput: true,
      jsonSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["age", "name"],
        additionalProperties: false,
      },
    };
    await useLlm_call(mockStateOpenAi, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "output",
            strict: true,
            schema: mock_options.jsonSchema,
          },
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should openai and response_format with functionCallStrictInput as true", async () => {
    const mock_options = {
      functionCallStrictInput: true,
      jsonSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["age", "name"],
        additionalProperties: false,
      },
    };
    await useLlm_call(mockStateOpenAi, mockMessages, mock_options);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "output",
            strict: true,
            schema: mock_options.jsonSchema,
          },
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should openai and response_format with functionCallStrictInput as undefined", async () => {
    const mock_options = {
      functionCallStrictInput: undefined,
      jsonSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["age", "name"],
        additionalProperties: false,
      },
    };
    await useLlm_call(mockStateOpenAi, mockMessages, mock_options as any);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "output",
            strict: false,
            schema: mock_options.jsonSchema,
          },
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should openai and response_format with no strict property with functionCallStrictInput as false", async () => {
    const mock_options = {
      functionCallStrictInput: false,
      jsonSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["age", "name"],
        additionalProperties: false,
      },
    };
    await useLlm_call(mockStateOpenAi, mockMessages, mock_options);
    expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
      method: mockConfig.method,
      body: JSON.stringify({
        prompt: mockMessages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "output",
            strict: false,
            schema: mock_options.jsonSchema,
          },
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("should handle mock provider", async () => {
    const mockStateMock = {
      key: "openai.chat-mock.v1",
      provider: "openai.chat-mock",
    } as unknown as GenericLLm & {
      key: LlmProviderKey;
      provider: LlmProvider;
    };
    
    getLlmConfigMock.mockReturnValue({
      ...mockConfig,
      provider: "openai.chat-mock",
    });
    
    getOutputParserMock.mockReturnValueOnce("mockParsedOutput");
    
    const result = await useLlm_call(mockStateMock, mockMessages, mockOptions);
    
    // Mock provider doesn't call apiRequest
    expect(apiRequestMock).not.toHaveBeenCalled();
    
    // But it should call getOutputParser with the mock response
    expect(getOutputParser).toHaveBeenCalledWith(
      { key: mockStateMock.key, provider: mockStateMock.provider },
      expect.objectContaining({
        id: "0123-45-6789",
        model: "model",
        created: expect.any(Number),
        usage: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 },
        choices: [
          {
            message: {
              role: "assistant",
              content: expect.stringContaining("Hello world from LLM!"),
            },
          },
        ],
      })
    );
    
    expect(result).toBe("mockParsedOutput");
  });

  describe("Google provider", () => {
    const mockStateGoogle = {
      key: "google.chat.v1",
      provider: "google.chat",
    } as unknown as GenericLLm & {
      key: LlmProviderKey;
      provider: LlmProvider;
    };

    beforeEach(() => {
      getLlmConfigMock.mockReturnValue({
        ...mockConfig,
        provider: "google.chat",
      });
    });

    it("should handle Google provider with function call", async () => {
      const mock_options = {
        functionCall: "auto" as GenericFunctionCall,
      };
      await useLlm_call(mockStateGoogle, mockMessages, mock_options);
      expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
        method: mockConfig.method,
        body: JSON.stringify({
          prompt: mockMessages,
          toolConfig: {
            functionCallingConfig: {
              mode: "auto",
            },
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    it("should handle Google provider with function call any", async () => {
      const mock_options = {
        functionCall: "any" as GenericFunctionCall,
      };
      await useLlm_call(mockStateGoogle, mockMessages, mock_options);
      expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
        method: mockConfig.method,
        body: JSON.stringify({
          prompt: mockMessages,
          toolConfig: {
            functionCallingConfig: {
              mode: "any",
            },
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    it("should handle Google provider with function call none", async () => {
      const mock_options = {
        functionCall: "none" as GenericFunctionCall,
      };
      await useLlm_call(mockStateGoogle, mockMessages, mock_options);
      expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
        method: mockConfig.method,
        body: JSON.stringify({
          prompt: mockMessages,
          toolConfig: {
            functionCallingConfig: {
              mode: "none",
            },
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    it("should handle Google provider with functions", async () => {
      const mock_options = {
        functions: [
          { 
            name: "testFunction", 
            description: "Test description", 
            parameters: {
              type: "object",
              properties: {
                param1: { type: "string" }
              }
            } 
          }
        ],
      };
      await useLlm_call(mockStateGoogle, mockMessages, mock_options);
      expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
        method: mockConfig.method,
        body: JSON.stringify({
          prompt: mockMessages,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "testFunction",
                  description: "Test description",
                  parameters: cleanJsonSchemaFor(
                    mock_options.functions[0].parameters,
                    "google.chat"
                  ),
                },
              ],
            },
          ],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    it("should handle Google provider with both functions and functionCall", async () => {
      const mock_options = {
        functionCall: "auto" as GenericFunctionCall,
        functions: [
          { 
            name: "weatherFunction", 
            description: "Get weather", 
            parameters: {} 
          }
        ],
      };
      await useLlm_call(mockStateGoogle, mockMessages, mock_options);
      expect(apiRequestMock).toHaveBeenCalledWith("http://api.test/endpoint", {
        method: mockConfig.method,
        body: JSON.stringify({
          prompt: mockMessages,
          toolConfig: {
            functionCallingConfig: {
              mode: "auto",
            },
          },
          tools: [
            {
              functionDeclarations: [
                {
                  name: "weatherFunction",
                  description: "Get weather",
                  parameters: cleanJsonSchemaFor({}, "google.chat"),
                },
              ],
            },
          ],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });
});
