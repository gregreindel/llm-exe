import {
  GenericLLm,
  IChatMessages,
} from "@/types";
import { getLlmConfig } from "@/llm/config";
import { createLlmV3 } from "@/llm/llmV2";
import { createLlmV3_call } from "@/llm/llmV2.call";


jest.mock("@/llm/config", () => ({
  getLlmConfig: jest.fn(),
}));

jest.mock("@/llm/llmV2.call", () => ({
  createLlmV3_call: jest.fn(),
}));


describe("createLlmV3", () => {
  const getLlmConfigMock = getLlmConfig as jest.Mock;
  
  const mockProvidor = "openai";
  const mockOptions = {
    option1: "value1",
  } as Partial<GenericLLm>;
  const mockConfig = {
    options: {
      option1: {}
    }

  };

  beforeEach(() => {
    jest.clearAllMocks();
    getLlmConfigMock.mockReturnValue(mockConfig);
  });

  it("should create an instance with call, getTraceId, and getMetadata methods", () => {
    const { call, getTraceId, getMetadata } = createLlmV3(
      mockProvidor,
      mockOptions
    );

    expect(typeof call).toBe("function");
    expect(typeof getTraceId).toBe("function");
    expect(typeof getMetadata).toBe("function");
  });

  it("getTraceId should return fixed traceId", () => {
    const { getTraceId } = createLlmV3(mockProvidor, mockOptions);

    expect(getTraceId()).toBe("this.traceId");
  });

  it("getMetadata should return state excluding API keys", () => {
    const { getMetadata } = createLlmV3(mockProvidor, mockOptions);
    const metadata = getMetadata();
    expect(metadata).not.toHaveProperty("awsSecretKey");
    expect(metadata).not.toHaveProperty("awsAccessKey");
    expect(metadata).not.toHaveProperty("openAiApiKey");
    expect(metadata).not.toHaveProperty("anthropicApiKey");
  });

  it("call method should invoke createLlmV3_call with correct arguments", async () => {
    const mockMessages = [
      {
        role: "user",
        content: "Hello",
      },
    ] as IChatMessages;
    const { call } = createLlmV3(mockProvidor, mockOptions);

    await call(mockMessages);

    expect(createLlmV3_call).toHaveBeenCalledWith(
      expect.anything(),
      mockMessages,
      undefined
    );
  });
});
