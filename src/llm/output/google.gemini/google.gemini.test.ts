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
  };
  it("creates class with expected properties", () => {
    const output = OutputGoogleGeminiChat(mock as any).getResult();
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates class with expected properties", () => {
    const output = OutputGoogleGeminiChat(mock as any).getResult();
    expect(typeof (output as any).id).toEqual("string");
    expect((output as any).name).toEqual(mock.modelVersion);
    expect(typeof (output as any).created).toEqual("number");
    expect((output as any).usage).toEqual({
      input_tokens: mock.usageMetadata.promptTokenCount,
      output_tokens: mock.usageMetadata.candidatesTokenCount,
      total_tokens: mock.usageMetadata.totalTokenCount,
    });
  });
  it("creates class with expected methods", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(output).toHaveProperty("getResult");
    expect(typeof output.getResult).toEqual("function");
    expect(output).toHaveProperty("getResultText");
    expect(typeof output.getResultText).toEqual("function");
    expect(output).toHaveProperty("getResult");
    expect(typeof output.getResult).toEqual("function");
    expect(output).toHaveProperty("getResultContent");
    expect(typeof output.getResultContent).toEqual("function");
  });
  it("getResults gets results", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(output.getResult()).toEqual({
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
  it("getResult gets result", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(output.getResult()).toEqual({
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
      usage: {
        input_tokens: mock.usageMetadata.promptTokenCount,
        output_tokens: mock.usageMetadata.candidatesTokenCount,
        total_tokens: mock.usageMetadata.totalTokenCount,
      },
    });
  });

  it("getResultContent gets result", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(output.getResultText()).toEqual(
      '\n```json\n{\n "intent": "rent_car",\n "confidence": "95"\n}\n```'
    );
  });

  it("getResultContent gets [] if not exists", () => {
    const output = OutputGoogleGeminiChat(mock as any);
    expect(output.getResultContent(8)).toEqual([]);
  });

  it("handles multiple parts with function call and text", () => {
    const mockMultipleParts: GoogleGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: "I'll help you with that.",
              },
              {
                functionCall: {
                  name: "get_weather",
                  args: '{"location": "NYC"}',
                },
              },
            ],
            role: "model",
          },
          finishReason: "STOP",
        },
      ],
      usageMetadata: {
        promptTokenCount: 100,
        candidatesTokenCount: 50,
        totalTokenCount: 150,
      },
      modelVersion: "gemini-2.0-flash",
    };

    const output = OutputGoogleGeminiChat(mockMultipleParts as any);
    const result = output.getResult();
    
    expect(result.content).toHaveLength(2);
    expect(result.content[0]).toEqual({
      type: "text",
      text: "I'll help you with that.",
    });
    expect(result.content[1]).toEqual({
      type: "function_use",
      name: "get_weather",
      input: { location: "NYC" },
    });
  });

  it("handles multiple parts with only function calls", () => {
    const mockOnlyFunctions: GoogleGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                functionCall: {
                  name: "get_weather",
                  args: '{"location": "NYC"}',
                },
              },
              {
                functionCall: {
                  name: "get_time",
                  args: '{"timezone": "EST"}',
                },
              },
            ],
            role: "model",
          },
          finishReason: "STOP",
        },
      ],
      usageMetadata: {
        promptTokenCount: 100,
        candidatesTokenCount: 50,
        totalTokenCount: 150,
      },
      modelVersion: "gemini-2.0-flash",
    };

    const output = OutputGoogleGeminiChat(mockOnlyFunctions as any);
    const result = output.getResult();
    
    expect(result.content).toHaveLength(2);
    expect(result.content[0]).toEqual({
      type: "function_use",
      name: "get_weather",
      input: { location: "NYC" },
    });
    expect(result.content[1]).toEqual({
      type: "function_use",
      name: "get_time",
      input: { timezone: "EST" },
    });
  });

  it("handles multiple parts with only text", () => {
    const mockOnlyText: GoogleGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: "First part of response.",
              },
              {
                text: "Second part of response.",
              },
            ],
            role: "model",
          },
          finishReason: "STOP",
        },
      ],
      usageMetadata: {
        promptTokenCount: 100,
        candidatesTokenCount: 50,
        totalTokenCount: 150,
      },
      modelVersion: "gemini-2.0-flash",
    };

    const output = OutputGoogleGeminiChat(mockOnlyText as any);
    const result = output.getResult();
    
    expect(result.content).toHaveLength(2);
    expect(result.content[0]).toEqual({
      type: "text",
      text: "First part of response.",
    });
    expect(result.content[1]).toEqual({
      type: "text",
      text: "Second part of response.",
    });
  });
});
