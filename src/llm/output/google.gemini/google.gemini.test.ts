import { GoogleGeminiResponse } from "@/interfaces";
import { OutputGoogleGeminiChat } from ".";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:output/OutputGoogleGeminiChat", () => {
  const mock: GoogleGeminiResponse = {
    candidates: [
      {
        content: {
          parts: [
            {
              text: '\n```json\n{\n "intent": "rent_car",\n "confidence": "95"\n}\n```',
            },
          ],
          role: "model",
        },
        finishReason: "STOP",
        avgLogprobs: -0.011675960742510282,
      },
    ],
    usageMetadata: {
      promptTokenCount: 351,
      candidatesTokenCount: 26,
      totalTokenCount: 377,
      promptTokensDetails: [
        {
          modality: "TEXT",
          tokenCount: 351,
        },
      ],
      candidatesTokensDetails: [
        {
          modality: "TEXT",
          tokenCount: 26,
        },
      ],
    },
    modelVersion: "gemini-2.0-flash",
    responseId: "12345-67890",
  };
  it("creates output with expected properties", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates output with correct values", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(typeof output.id).toEqual("string");
    expect(output.name).toEqual(mock.modelVersion);
    expect(typeof output.created).toEqual("number");
    expect(output.usage).toEqual({
      input_tokens: mock.usageMetadata.promptTokenCount,
      output_tokens: mock.usageMetadata.candidatesTokenCount,
      total_tokens: mock.usageMetadata.totalTokenCount,
    });
  });
  it("formats content correctly", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(output.content).toEqual([
      {
        type: "text",
        text: '\n```json\n{\n "intent": "rent_car",\n "confidence": "95"\n}\n```',
      },
    ]);
    expect(output.stopReason).toEqual("stop");
  });
  it("returns complete output structure", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(output).toEqual({
      content: [
        {
          text: '\n```json\n{\n "intent": "rent_car",\n "confidence": "95"\n}\n```',
          type: "text",
        },
      ],
      created: expect.any(Number),
      id: expect.any(String), // id is generated and not part of the mock
      name: expect.any(String),
      options: [],
      stopReason: "stop",
      usage: { input_tokens: 351, output_tokens: 26, total_tokens: 377 },
    });
  });

  it("uses default model name when modelVersion is undefined and no config", () => {
    const mockWithoutModel = {
      ...mock,
      modelVersion: undefined,
    };
    const output = OutputGoogleGeminiChat(mockWithoutModel as any);
    expect(output.name).toBe("gemini");
  });

  it("uses config default model when modelVersion is undefined", () => {
    const mockWithoutModel = {
      ...mock,
      modelVersion: undefined,
    };
    const config = {
      options: {
        model: {
          default: "gemini-from-config",
        },
      },
    };
    const output = OutputGoogleGeminiChat(mockWithoutModel as any, config as any);
    expect(output.name).toBe("gemini-from-config");
  });

  it("handles missing candidates array", () => {
    const mockWithoutCandidates = {
      ...mock,
      candidates: undefined,
    };
    const output = OutputGoogleGeminiChat(mockWithoutCandidates as any);
    expect(output.content).toEqual([]);
    expect(output.options).toEqual([]);
    expect(output.stopReason).toBeUndefined();
  });

  it("handles empty candidates array", () => {
    const mockWithEmptyCandidates = {
      ...mock,
      candidates: [],
    };
    const output = OutputGoogleGeminiChat(mockWithEmptyCandidates as any);
    expect(output.content).toEqual([]);
    expect(output.options).toEqual([]);
    expect(output.stopReason).toBeUndefined();
  });

  it("handles multiple candidates, using first as content and rest as options", () => {
    const mockWithMultipleCandidates = {
      ...mock,
      candidates: [
        {
          content: {
            parts: [{ text: "Primary response" }],
            role: "model",
          },
          finishReason: "STOP",
          avgLogprobs: -0.01,
        },
        {
          content: {
            parts: [{ text: "Alternative response 1" }],
            role: "model",
          },
          finishReason: "STOP",
          avgLogprobs: -0.02,
        },
        {
          content: {
            parts: [{ text: "Alternative response 2" }],
            role: "model",
          },
          finishReason: "STOP",
          avgLogprobs: -0.03,
        },
      ],
    };
    const output = OutputGoogleGeminiChat(mockWithMultipleCandidates as any);
    expect(output.content).toEqual([
      { type: "text", text: "Primary response" },
    ]);
    expect(output.options).toHaveLength(2);
    expect(output.stopReason).toEqual("stop");
  });

  it("handles missing usageMetadata", () => {
    const mockWithoutUsage = {
      ...mock,
      usageMetadata: undefined,
    };
    const output = OutputGoogleGeminiChat(mockWithoutUsage as any);
    expect(output.usage).toEqual({
      input_tokens: undefined,
      output_tokens: undefined,
      total_tokens: undefined,
    });
  });

  it("handles candidate with function call", () => {
    const mockWithFunctionCall = {
      ...mock,
      candidates: [
        {
          content: {
            parts: [
              {
                functionCall: {
                  name: "get_weather",
                  args: { location: "NYC" },
                },
              },
            ],
            role: "model",
          },
          finishReason: "STOP",
          avgLogprobs: -0.01,
        },
      ],
    };
    const output = OutputGoogleGeminiChat(mockWithFunctionCall as any);
    expect(output.content).toHaveLength(1);
    expect(output.content[0].type).toEqual("function_use");
    expect((output.content[0] as any).name).toEqual("get_weather");
    expect((output.content[0] as any).input).toEqual({ location: "NYC" });
  });

  it("uses responseId as the output id", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(output.id).toEqual("12345-67890");
  });

  it("handles missing responseId", () => {
    const mockWithoutId = {
      ...mock,
      responseId: undefined,
    };
    const output = OutputGoogleGeminiChat(mockWithoutId as any);
    expect(output.id).toBeUndefined();
  });
});
