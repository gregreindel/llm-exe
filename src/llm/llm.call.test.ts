import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import {
  GenericLLm,
  IChatMessages,
  LlmProvider,
  LlmProviderKey,
  LlmExecutorWithFunctionsOptions,
} from "@/types";
import { getOutputParser } from "@/llm/output";
import { parseHeaders } from "@/llm/_utils.parseHeaders";
import { useLlm_call } from "@/llm/llm.call";

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
      _options: mockOptions,
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

  it("should handle openai.chat-mock provider", async () => {
    const mockMockState = {
      key: "openai.chat-mock.v1",
      provider: "openai.chat-mock",
    } as unknown as GenericLLm & {
      key: LlmProviderKey;
      provider: LlmProvider;
    };

    const mockMockConfig = {
      ...mockConfig,
      provider: "openai.chat-mock",
    };

    getLlmConfigMock.mockReturnValue(mockMockConfig);
    getOutputParserMock.mockReturnValueOnce("parsedOutput");

    const result = await useLlm_call(mockMockState, mockMessages);

    // Should not call apiRequest for mock provider
    expect(apiRequestMock).not.toHaveBeenCalled();
    
    // Should still call output parser with mock response
    expect(getOutputParser).toHaveBeenCalledWith(
      { key: mockMockState.key, provider: mockMockState.provider },
      expect.objectContaining({
        id: expect.any(String),
        model: "model",
        created: expect.any(Number),
        usage: expect.any(Object),
        choices: expect.arrayContaining([
          expect.objectContaining({
            message: expect.objectContaining({
              role: "assistant",
              content: expect.stringContaining("Hello world from LLM!"),
            }),
          }),
        ]),
      })
    );

    expect(result).toBe("parsedOutput");
  });
});