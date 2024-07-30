import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getOutputParser } from "@/llm/output";
import {
  GenericLLm,
  IChatMessages,
  LlmProvidor,
  OpenAiLlmExecutorOptions,
} from "@/types";
import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import { parseHeaders } from "@/llm/_utils.parseHeaders";
import { createLlmV3_call } from "@/llm/llmV2.call";


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

jest.mock("@/llm/config");

describe("createLlmV3_call", () => {
  const getLlmConfigMock = getLlmConfig as jest.Mock;
  const replaceTemplateStringSimpleMock =
    replaceTemplateStringSimple as jest.Mock;
  const mapBodyMock = mapBody as jest.Mock;
  const parseHeadersMock = parseHeaders as jest.Mock;
  const apiRequestMock = apiRequest as jest.Mock;
  const getOutputParserMock = getOutputParser as jest.Mock;

  const mockState = {
    providor: "testProvider",
  } as unknown as GenericLLm & {
    providor: LlmProvidor;
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
    provider: "testProvider",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getLlmConfigMock.mockReturnValue(mockConfig);
    replaceTemplateStringSimpleMock.mockReturnValue("http://api.test/endpoint");
    mapBodyMock.mockReturnValue({
      prompt: mockMessages,
    });
    parseHeadersMock.mockResolvedValue({
      "Content-Type": "application/json",
    });
    apiRequestMock.mockResolvedValue({
      data: "response",
    });
    getOutputParserMock.mockReturnValue("parsedOutput");
  });

  it("should call all necessary functions and return parsed output", async () => {
    const result = await createLlmV3_call(mockState, mockMessages, mockOptions);

    expect(getLlmConfig).toHaveBeenCalledWith(mockState.providor);
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
    expect(apiRequest).toHaveBeenCalledWith(
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
    expect(getOutputParser).toHaveBeenCalledWith(mockConfig.provider, {
      data: "response",
    });

    expect(result).toBe("parsedOutput");
  });

  it("should handle an error in apiRequest", async () => {
    (apiRequest as jest.Mock).mockRejectedValue(
      new Error("API Request Failed")
    );

    await expect(
      createLlmV3_call(mockState, mockMessages, mockOptions)
    ).rejects.toThrow("API Request Failed");
  });
});
