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
  it("creates class with expected properties", () => {
    const output = OutputXAIChat(mock as any).getResult();
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates class with expected properties", () => {
    const output = OutputXAIChat(mock as any).getResult();
    expect((output as any).id).toEqual(mock.id);
    expect((output as any).name).toEqual(mock.model);
    expect((output as any).created).toEqual(mock.created);
    expect((output as any).usage).toEqual({
      input_tokens: mock.usage.prompt_tokens,
      output_tokens: mock.usage.completion_tokens,
      total_tokens: mock.usage.total_tokens,
    });
  });
  it("creates class with expected methods", () => {
    const output = OutputXAIChat(mock as any);
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
    const output = OutputXAIChat(mock as any);
    expect(output.getResult()).toEqual({
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
  it("getResult gets result", () => {
    const output = OutputXAIChat(mock as any);
    expect(output.getResult()).toEqual({
      content: [
        {
          text: "This is the assistant message content.",
          type: "text",
        },
      ],
      created: mock.created,
      id: mock.id,
      name: "gpt-3.5-turbo-0301",
      options: [],
      stopReason: "stop",
      usage: {
        input_tokens: mock.usage.prompt_tokens,
        output_tokens: mock.usage.completion_tokens,
        total_tokens: mock.usage.total_tokens,
      },
    });
  });
  it("getResultContent gets result", () => {
    const output = OutputXAIChat(mock as any);
    expect(output.getResultText()).toEqual(
      "This is the assistant message content."
    );
  });

  it("getResultContent gets [] if not exists", () => {
    const output = OutputXAIChat(mock as any);
    expect(output.getResultContent(8)).toEqual([]);
  });

  it("getResultContent gets tool_calls if content is null", () => {
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
    expect(output.getResultContent()).toEqual(
      [{"input": {}, "name": "test_fn", "type": "function_use"}]
    );
  });
});
