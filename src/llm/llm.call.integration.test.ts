import { useLlm_call } from "@/llm/llm.call";
import { apiRequest } from "@/utils/modules/request";
import { parseHeaders } from "@/llm/_utils.parseHeaders";
import {
  GenericLLm,
  IChatMessages,
  LlmProvider,
  LlmProviderKey,
  LlmExecutorWithFunctionsOptions,
} from "@/types";

// Mock only the external dependencies
jest.mock("@/utils/modules/request", () => ({
  apiRequest: jest.fn(),
}));

jest.mock("@/llm/_utils.parseHeaders", () => ({
  parseHeaders: jest.fn(),
}));

describe("useLlm_call integration tests", () => {
  const apiRequestMock = apiRequest as jest.Mock;
  const parseHeadersMock = parseHeaders as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    parseHeadersMock.mockResolvedValue({
      "Content-Type": "application/json",
    });
    apiRequestMock.mockResolvedValue({
      choices: [{ message: { content: "response" } }],
    });
  });

  describe("OpenAI provider", () => {
    const mockState = {
      key: "openai.chat.v1" as LlmProviderKey,
      provider: "openai.chat" as LlmProvider,
      model: "gpt-4",
      openAiApiKey: "test-key",
    } as GenericLLm & {
      key: LlmProviderKey;
      provider: LlmProvider;
    };

    it("should handle jsonSchema option", async () => {
      const messages: IChatMessages = [{ role: "user", content: "Hello" }];
      const options: LlmExecutorWithFunctionsOptions = {
        jsonSchema: {
          type: "object",
          properties: { name: { type: "string" } },
        },
      };

      await useLlm_call(mockState, messages, options);

      expect(apiRequestMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(
            '"response_format":{"type":"json_schema","json_schema":{"name":"output","strict":false,"schema":{"type":"object","properties":{"name":{"type":"string"}}}}}'
          ),
        })
      );
    });

    it("should handle jsonSchema with functionCallStrictInput", async () => {
      const messages: IChatMessages = [{ role: "user", content: "Hello" }];
      const options: LlmExecutorWithFunctionsOptions = {
        jsonSchema: {
          type: "object",
          properties: { name: { type: "string" } },
        },
        functionCallStrictInput: true,
      };

      await useLlm_call(mockState, messages, options);

      expect(apiRequestMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"strict":true'),
        })
      );
    });

    it("should handle functionCall option", async () => {
      const messages: IChatMessages = [{ role: "user", content: "Hello" }];
      const options: LlmExecutorWithFunctionsOptions = {
        functionCall: "auto",
        functions: [
          {
            name: "test",
            description: "Test function",
            parameters: { type: "object", properties: {} },
          },
        ],
      };

      await useLlm_call(mockState, messages, options);

      expect(apiRequestMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"tool_choice":"auto"'),
        })
      );
    });

    it("should handle functions option", async () => {
      const messages: IChatMessages = [{ role: "user", content: "Hello" }];
      const options: LlmExecutorWithFunctionsOptions = {
        functions: [
          {
            name: "test",
            description: "Test function",
            parameters: { type: "object", properties: {} },
          },
        ],
      };

      await useLlm_call(mockState, messages, options);

      expect(apiRequestMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(
            '"tools":[{"type":"function","function":{"name":"test","description":"Test function","parameters":{"type":"object","properties":{}},"strict":false}}]'
          ),
        })
      );
    });

    it("should handle functionCall none to remove functions", async () => {
      const messages: IChatMessages = [{ role: "user", content: "Hello" }];
      const options: LlmExecutorWithFunctionsOptions<"none"> = {
        functionCall: "none",
        functions: [
          {
            name: "test",
            description: "Test function",
            parameters: { type: "object", properties: {} },
          },
        ],
      };

      await useLlm_call(mockState, messages, options);

      const callArgs = apiRequestMock.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.tool_choice).toBe("none");
      expect(body.tools).toBeUndefined();
    });
  });

  describe("Anthropic provider", () => {
    const mockState = {
      key: "anthropic.chat.v1" as LlmProviderKey,
      provider: "anthropic.chat" as LlmProvider,
      model: "claude-3-sonnet",
      anthropicApiKey: "test-key",
      maxTokens: 4096,
    } as GenericLLm & {
      key: LlmProviderKey;
      provider: LlmProvider;
    };

    it("should handle functionCall option", async () => {
      const messages: IChatMessages = [{ role: "user", content: "Hello" }];
      const options: LlmExecutorWithFunctionsOptions = {
        functionCall: "auto",
        functions: [
          {
            name: "test",
            description: "Test function",
            parameters: { type: "object", properties: {} },
          },
        ],
      };

      await useLlm_call(mockState, messages, options);

      expect(apiRequestMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"tool_choice":{"type":"auto"}'),
        })
      );
    });

    it("should handle functions option", async () => {
      const messages: IChatMessages = [{ role: "user", content: "Hello" }];
      const options: LlmExecutorWithFunctionsOptions = {
        functions: [
          {
            name: "test",
            description: "Test function",
            parameters: {
              type: "object",
              properties: { input: { type: "string" } },
            },
          },
        ],
      };

      await useLlm_call(mockState, messages, options);

      expect(apiRequestMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(
            '"tools":[{"name":"test","description":"Test function","input_schema":{"type":"object","properties":{"input":{"type":"string"}}}}]'
          ),
        })
      );
    });

    it("should handle functionCall none to remove functions", async () => {
      const messages: IChatMessages = [{ role: "user", content: "Hello" }];
      const options: LlmExecutorWithFunctionsOptions<"none"> = {
        functionCall: "none",
        functions: [
          {
            name: "test",
            description: "Test function",
            parameters: { type: "object", properties: {} },
          },
        ],
      };

      await useLlm_call(mockState, messages, options);

      const callArgs = apiRequestMock.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.tool_choice).toBeUndefined();
      expect(body.tools).toBeUndefined();
    });
  });

  describe("Provider without option support", () => {
    const mockState = {
      key: "amazon:meta.chat.v1" as LlmProviderKey,
      provider: "amazon:meta.chat" as LlmProvider,
      prompt: "test",
      model: "meta.llama2-70b-chat-v1",
      awsRegion: "us-east-1",
    } as GenericLLm & {
      key: LlmProviderKey;
      provider: LlmProvider;
    };

    it("should ignore options for providers without support", async () => {
      const messages = "Hello";
      const options: LlmExecutorWithFunctionsOptions = {
        functionCall: "auto",
        functions: [
          {
            name: "test",
            description: "Test function",
            parameters: { type: "object", properties: {} },
          },
        ],
      };

      parseHeadersMock.mockResolvedValue({});
      apiRequestMock.mockResolvedValue({
        completions: [{ data: { text: "response" } }],
      });

      await useLlm_call(mockState, messages, options);

      const callArgs = apiRequestMock.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      // Should not have tool_choice or tools in the body
      expect(body.tool_choice).toBeUndefined();
      expect(body.tools).toBeUndefined();
      expect(body.prompt).toBe("Hello");
    });
  });
});
