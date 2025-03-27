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

  //   it("getResultContent gets tool_calls if content is null", () => {
  //     const output = OutputGoogleGeminiChat({
  //       id: "chatcmpl-7KfsdfdsfZj1waHPfsdEZ",
  //       object: "chat.completion",
  //       created: 1685025755,
  //       model: "gpt-3.5-turbo-0301",
  //       usage: {
  //         prompt_tokens: 427,
  //         completion_tokens: 1,
  //         total_tokens: 428,
  //       },
  //       choices: [
  //         {
  //           message: {
  //             role: "assistant",
  //             content: null,
  //             tool_calls: [
  //               {
  //                 type: "function",
  //                 function: {
  //                   name: "test_fn",
  //                   arguments: "{}",
  //                 },
  //               },
  //             ],
  //           },
  //           finish_reason: "stop",
  //           index: 0,
  //         },
  //       ],
  //     } as unknown as OpenAiResponse);
  //     expect(output.getResultContent()).toEqual(
  //       [{"input": {}, "name": "test_fn", "type": "function_use"}]
  //     );
  //   });
});
