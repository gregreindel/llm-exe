import { OpenAiResponse } from "@/interfaces";
import { OutputDeepSeekChat } from "@/llm/output/deepseek";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:output/OutputDeepSeekChat", () => {
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
    const output = OutputDeepSeekChat(mock as any);
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates output with correct values", () => {
    const output = OutputDeepSeekChat(mock as any);
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
    const output = OutputDeepSeekChat(mock as any);
    expect(output.content).toEqual([
      {
        type: "text",
        text: "This is the assistant message content.",
      },
    ]);
    expect(output.stopReason).toEqual("stop");
  });
  it("returns complete output structure", () => {
    const output = OutputDeepSeekChat(mock as any);
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
    const output = OutputDeepSeekChat({
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
    } as unknown as OpenAiResponse);
    expect(output.content).toEqual(
      [{"functionId": "call_123", "input": {}, "name": "test_fn", "type": "function_use"}]
    );
  });

  it("uses default model name when model is undefined and no config", () => {
    const mockWithoutModel = {
      ...mock,
      model: undefined,
    };
    const output = OutputDeepSeekChat(mockWithoutModel as any);
    expect(output.name).toBe("deepseek.unknown");
  });

  it("uses config default model when model is undefined", () => {
    const mockWithoutModel = {
      ...mock,
      model: undefined,
    };
    const config = {
      options: {
        model: {
          default: "deepseek-from-config",
        },
      },
    };
    const output = OutputDeepSeekChat(mockWithoutModel as any, config as any);
    expect(output.name).toBe("deepseek-from-config");
  });

  it("handles missing choices array", () => {
    const mockWithoutChoices = {
      ...mock,
      choices: undefined,
    };
    const output = OutputDeepSeekChat(mockWithoutChoices as any);
    expect(output.content).toEqual([]);
    expect(output.options).toEqual([]);
    expect(output.stopReason).toBeUndefined();
  });

  it("handles empty choices array", () => {
    const mockWithEmptyChoices = {
      ...mock,
      choices: [],
    };
    const output = OutputDeepSeekChat(mockWithEmptyChoices as any);
    expect(output.content).toEqual([]);
    expect(output.options).toEqual([]);
    expect(output.stopReason).toBeUndefined();
  });
});
