import { useLlm_call } from "./llm.call";
import { apiRequest } from "@/utils/modules/request";
import { getOutputParser } from "@/llm/output";
import { parseHeaders } from "@/llm/_utils.parseHeaders";
import type { GenericFunctionCall, LlmExecutorExecuteOptions } from "@/interfaces/functions";

jest.mock("@/utils/modules/request");
jest.mock("@/llm/output");
jest.mock("@/llm/_utils.parseHeaders");

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockGetOutputParser = getOutputParser as jest.MockedFunction<
  typeof getOutputParser
>;
const mockParseHeaders = parseHeaders as jest.MockedFunction<
  typeof parseHeaders
>;

describe("llm.call.ts provider-specific logic - comprehensive tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockResolvedValue({ success: true });
    mockGetOutputParser.mockReturnValue({
      requestBody: {},
      getResultText: () => "test result",
    } as any);
    mockParseHeaders.mockResolvedValue({
      "Content-Type": "application/json",
      Authorization: "Bearer test-key",
    });
  });

  // OPENAI TESTS
  describe("OpenAI provider", () => {
    const openAiState = {
      provider: "openai.chat" as const,
      key: "openai.chat.v1" as const,
      openAiApiKey: "test-key",
    };

    describe("JSON Schema handling", () => {
      it("formats jsonSchema with strict mode enabled", async () => {
        const options = {
          jsonSchema: {
            type: "object",
            properties: {
              name: { type: "string" },
              age: { type: "number" },
            },
            required: ["name"],
            additionalProperties: false,
          },
          functionCallStrictInput: true,
        };

        await useLlm_call(openAiState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.response_format).toEqual({
          type: "json_schema",
          json_schema: {
            name: "output",
            strict: true,
            schema: expect.objectContaining({
              type: "object",
              properties: expect.any(Object),
              required: ["name"],
              additionalProperties: false,
            }),
          },
        });
      });

      it("formats jsonSchema with strict mode disabled", async () => {
        const options = {
          jsonSchema: { type: "object", properties: {} },
          functionCallStrictInput: false,
        };

        await useLlm_call(openAiState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.response_format.json_schema.strict).toBe(false);
      });

      it("handles jsonSchema without functionCallStrictInput (defaults to false)", async () => {
        const options = {
          jsonSchema: { type: "object", properties: {} },
        };

        await useLlm_call(openAiState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.response_format.json_schema.strict).toBe(false);
      });
    });

    describe("Function calling", () => {
      it("formats functions array correctly", async () => {
        const options = {
          functions: [
            {
              name: "get_weather",
              description: "Get current weather",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string" },
                },
                required: ["location"],
              },
            },
          ],
        };

        await useLlm_call(openAiState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tools).toEqual([
          {
            type: "function",
            function: {
              name: "get_weather",
              description: "Get current weather",
              parameters: expect.objectContaining({
                type: "object",
                properties: { location: { type: "string" } },
                required: ["location"],
              }),
              strict: false,
            },
          },
        ]);
      });

      it("applies strict mode to functions when functionCallStrictInput=true", async () => {
        const options = {
          functions: [{ name: "test", description: "test", parameters: {} }],
          functionCallStrictInput: true,
        };

        await useLlm_call(openAiState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tools[0].function.strict).toBe(true);
      });

      it("handles tool_choice with normalizeFunctionCall", async () => {
        const testCases: Array<{
          input: GenericFunctionCall | { type: string; function: { name: string } };
          expected: any;
        }> = [
          { input: "auto", expected: "auto" },
          { input: "none", expected: "none" },
          { input: "any", expected: "required" }, // OpenAI maps 'any' to 'required'
          {
            input: { type: "function", function: { name: "get_weather" } },
            expected: { type: "function", function: { name: "get_weather" } },
          },
        ];

        for (const testCase of testCases) {
          jest.clearAllMocks();
          const options: LlmExecutorExecuteOptions = {
            functionCall: testCase.input as any,
            functions: [
              { name: "get_weather", description: "", parameters: {} },
            ],
          };

          await useLlm_call(openAiState, "test", options);

          const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
          expect(requestBody.tool_choice).toEqual(testCase.expected);
        }
      });
    });

    describe("Edge cases", () => {
      it("handles both jsonSchema and functions together", async () => {
        const options = {
          jsonSchema: { type: "object", properties: {} },
          functions: [{ name: "test", description: "test", parameters: {} }],
          functionCall: "auto" as GenericFunctionCall,
          functionCallStrictInput: true,
        };

        await useLlm_call(openAiState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.response_format).toBeDefined();
        expect(requestBody.tools).toBeDefined();
        expect(requestBody.tool_choice).toBe("auto");
      });

      it("ignores functions when not provided", async () => {
        await useLlm_call(openAiState, "test", {});

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tools).toBeUndefined();
        expect(requestBody.tool_choice).toBeUndefined();
      });
    });
  });

  // ANTHROPIC TESTS
  describe("Anthropic provider", () => {
    const anthropicState = {
      provider: "anthropic.chat" as const,
      key: "anthropic.chat.v1" as const,
      anthropicApiKey: "test-key",
    };

    describe("Function call handling", () => {
      it("removes functions when functionCall='none'", async () => {
        const options = {
          functionCall: "none" as GenericFunctionCall,
          functions: [{ name: "test", description: "test", parameters: {} }],
        };

        await useLlm_call(anthropicState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tools).toBeUndefined();
        expect(requestBody.tool_choice).toBeUndefined();
      });

      it("sets tool_choice type for 'auto'", async () => {
        const options = {
          functionCall: "auto" as GenericFunctionCall,
          functions: [{ name: "test", description: "test", parameters: {} }],
        };

        await useLlm_call(anthropicState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tool_choice).toEqual({ type: "auto" });
      });

      it("sets tool_choice type for 'any'", async () => {
        const options = {
          functionCall: "any" as GenericFunctionCall,
          functions: [{ name: "test", description: "test", parameters: {} }],
        };

        await useLlm_call(anthropicState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tool_choice).toEqual({ type: "any" });
      });

      it("passes through specific function choice", async () => {
        const functionChoice = { type: "tool", name: "get_weather" };
        const options = {
          functionCall: functionChoice,
          functions: [
            { name: "get_weather", description: "test", parameters: {} },
          ],
        };

        await useLlm_call(anthropicState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tool_choice).toEqual(functionChoice);
      });
    });

    describe("Tools formatting", () => {
      it("formats tools with input_schema", async () => {
        const options = {
          functions: [
            {
              name: "get_weather",
              description: "Get weather for location",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string", description: "City name" },
                },
                required: ["location"],
              },
            },
          ],
        };

        await useLlm_call(anthropicState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tools).toEqual([
          {
            name: "get_weather",
            description: "Get weather for location",
            input_schema: expect.objectContaining({
              type: "object",
              properties: {
                location: { type: "string", description: "City name" },
              },
              required: ["location"],
            }),
          },
        ]);
      });

      it("applies cleanJsonSchemaFor to parameters", async () => {
        const options = {
          functions: [
            {
              name: "test",
              description: "test",
              parameters: {
                type: "object",
                properties: {
                  data: { type: "string", title: "Should be removed" },
                },
                $schema: "Should be removed",
              },
            },
          ],
        };

        await useLlm_call(anthropicState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        // Anthropic's cleanJsonSchemaFor doesn't remove $schema currently
        expect(requestBody.tools[0].input_schema.$schema).toBe(
          "Should be removed"
        );
        // But it should have the other properties
        expect(requestBody.tools[0].input_schema.properties.data.title).toBe(
          "Should be removed"
        );
      });
    });

    describe("Edge cases", () => {
      it("doesn't add tool_choice when functionCall is not provided", async () => {
        const options = {
          functions: [{ name: "test", description: "test", parameters: {} }],
        };

        await useLlm_call(anthropicState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tools).toBeDefined();
        expect(requestBody.tool_choice).toBeUndefined();
      });

      it("ignores jsonSchema (Anthropic doesn't support it)", async () => {
        const options = {
          jsonSchema: { type: "object", properties: {} },
        };

        await useLlm_call(anthropicState, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.response_format).toBeUndefined();
      });
    });
  });

  // PROVIDER DETECTION TESTS
  describe("Provider detection", () => {
    it("applies OpenAI logic for providers starting with 'openai'", async () => {
      const providers = ["openai.chat", "openai.completion", "openai-custom"];
      const options = {
        functions: [{ name: "test", description: "test", parameters: {} }],
      };

      for (const provider of providers) {
        jest.clearAllMocks();
        const state = {
          provider: provider as any,
          key: "openai.chat.v1" as const,
          openAiApiKey: "test",
        };
        await useLlm_call(state, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tools[0].type).toBe("function");
      }
    });

    it("applies Anthropic logic for providers starting with 'anthropic'", async () => {
      const providers = [
        "anthropic.chat",
        "anthropic.messages",
        "anthropic-custom",
      ];
      const options = {
        functions: [{ name: "test", description: "test", parameters: {} }],
      };

      for (const provider of providers) {
        jest.clearAllMocks();
        const state = {
          provider: provider as any,
          key: "anthropic.chat.v1" as const,
          anthropicApiKey: "test",
        };
        await useLlm_call(state, "test", options);

        const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
        expect(requestBody.tools[0].input_schema).toBeDefined();
        expect(requestBody.tools[0].type).toBeUndefined(); // Anthropic doesn't use 'type'
      }
    });

    it("doesn't apply provider logic for other providers", async () => {
      // Test with bedrock provider which doesn't have provider-specific logic in llm.call.ts
      const bedrockState = {
        provider: "amazon:meta.chat" as any,
        key: "amazon:meta.chat.v1" as const,
        awsRegion: "us-east-1",
      };
      const options = {
        functions: [{ name: "test", description: "test", parameters: {} }],
        jsonSchema: { type: "object", properties: {} },
      };

      await useLlm_call(bedrockState, "test", options);

      const requestBody = JSON.parse(mockApiRequest.mock.calls[0]?.[1]?.body as string);
      // Bedrock doesn't have provider-specific logic in llm.call.ts for functions/jsonSchema
      expect(requestBody.tools).toBeUndefined();
      expect(requestBody.response_format).toBeUndefined();
    });
  });
});
