import { XAiResponse } from "@/interfaces";
import { OutputXAIChat } from "@/llm/output/xai";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:output/OutputXAIChat", () => {
  const mock = {
    id: "chatcmpl-7KfsdfdsfZj1waHPfsdEZ",
    object: "chat.completion",
    created: 1685025755,
    model: "gpt-3.5-turbo-0301",
    usage: {
      prompt_tokens: 427,
      completion_tokens: 1,
      total_tokens: 428,
    },
    choices: [
      {
        message: {
          role: "assistant",
          content: "This is the assistant message content.",
        },
        finish_reason: "stop",
        index: 0,
      },
    ],
  };
  it("creates output with expected properties", () => {
    const output = OutputXAIChat(mock as any);
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates output with correct values", () => {
    const output = OutputXAIChat(mock as any);
    expect(output.id).toEqual(mock.id);
    expect(output.name).toEqual(mock.model);
    expect(output.created).toEqual(mock.created);
    expect(output.usage).toEqual({
      input_tokens: mock.usage.prompt_tokens,
      output_tokens: mock.usage.completion_tokens,
      total_tokens: mock.usage.total_tokens,
    });
  });
  it("formats content correctly", () => {
    const output = OutputXAIChat(mock as any);
    expect(output.content).toEqual([
      {
        type: "text",
        text: "This is the assistant message content.",
      },
    ]);
    expect(output.stopReason).toEqual("stop");
  });
  it("returns complete output structure", () => {
    const output = OutputXAIChat(mock as any);
    expect(output).toEqual({
      content: [
        { text: "This is the assistant message content.", type: "text" },
      ],
      created: 1685025755,
      id: "chatcmpl-7KfsdfdsfZj1waHPfsdEZ",
      name: "gpt-3.5-turbo-0301",
      options: [],
      stopReason: "stop",
      usage: { input_tokens: 427, output_tokens: 1, total_tokens: 428 },
    });
  });


  it("handles tool_calls when content is null", () => {
    const output = OutputXAIChat({
      id: "chatcmpl-7KfsdfdsfZj1waHPfsdEZ",
      object: "chat.completion",
      created: 1685025755,
      model: "gpt-3.5-turbo-0301",
      usage: {
        prompt_tokens: 427,
        completion_tokens: 1,
        total_tokens: 428,
      },
      choices: [
        {
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_123",
                type: "function",
                function: {
                  name: "test_fn",
                  arguments: "{}",
                },
              },
            ],
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as unknown as XAiResponse);
    expect(output.content).toEqual(
      [{"functionId": "call_123", "input": {}, "name": "test_fn", "type": "function_use"}]
    );
  });
});
