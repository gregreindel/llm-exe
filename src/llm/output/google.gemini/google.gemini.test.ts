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



});
