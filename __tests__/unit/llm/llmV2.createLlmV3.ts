import { IChatMessages } from "@/types";
import { getLlmConfig } from "@/llm/config";
import { useLlm } from "@/llm/llm";
import { useLlm_call } from "@/llm/llm.call";

jest.mock("@/llm/config", () => ({
  getLlmConfig: jest.fn(),
}));

jest.mock("@/llm/llm.call", () => ({
  useLlm_call: jest.fn(),
}));

describe("useLlm", () => {
  const getLlmConfigMock = getLlmConfig as jest.Mock;

  const mockProvidor = "openai.chat-mock.v1";

  const mockOptions = {
    option1: "value1",
    model: "something",
    traceId: "custom-traceId",
  };
  const mockConfig = {
    options: {
      option1: {},
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getLlmConfigMock.mockReturnValue(mockConfig);
  });

  it("should create an instance with call, getTraceId, and getMetadata methods", () => {
    const { call, getTraceId, getMetadata } = useLlm(mockProvidor, mockOptions);

    expect(typeof call).toBe("function");
    expect(typeof getTraceId).toBe("function");
    expect(typeof getMetadata).toBe("function");
  });

  it("getTraceId should return fixed traceId", () => {
    const { getTraceId } = useLlm(mockProvidor, mockOptions);

    expect(getTraceId()).toBe(mockOptions.traceId);
  });

  it("getMetadata should return state excluding API keys", () => {
    const { getMetadata } = useLlm(mockProvidor, mockOptions);
    const metadata = getMetadata();
    expect(metadata).not.toHaveProperty("awsSecretKey");
    expect(metadata).not.toHaveProperty("awsAccessKey");
    expect(metadata).not.toHaveProperty("openAiApiKey");
    expect(metadata).not.toHaveProperty("anthropicApiKey");
  });

  it("call method should invoke useLlm_call with correct arguments", async () => {
    const mockMessages = [
      {
        role: "user",
        content: "Hello",
      },
    ] as IChatMessages;
    const { call } = useLlm(mockProvidor, mockOptions);

    await call(mockMessages);

    expect(useLlm_call).toHaveBeenCalledWith(
      expect.anything(),
      mockMessages,
      undefined
    );
  });
});
