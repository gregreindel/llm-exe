import { OpenAiResponse } from "@/interfaces";
import { OutputOpenAIChat } from "@/llm/output/openai";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:output/OutputOpenAIChat", () => {
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
    const output = OutputOpenAIChat(mock as any).getResult();
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates class with expected properties", () => {
    const output = OutputOpenAIChat(mock as any).getResult();
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
    const output = OutputOpenAIChat(mock as any);
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
    const output = OutputOpenAIChat(mock as any);
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
    const output = OutputOpenAIChat(mock as any);
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
    const output = OutputOpenAIChat(mock as any);
    expect(output.getResultText()).toEqual(
      "This is the assistant message content."
    );
  });

  it("getResultContent gets [] if not exists", () => {
    const output = OutputOpenAIChat(mock as any);
    expect(output.getResultContent(8)).toEqual([]);
  });

  it("getResultContent gets tool_calls if content is null", () => {
    const output = OutputOpenAIChat({
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
    } as unknown as OpenAiResponse);
    expect(output.getResultContent()).toEqual(
      [{"input": {}, "name": "test_fn", "type": "function_use"}]
    );
  });

  it("handles multiple tool calls", () => {
    const output = OutputOpenAIChat({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1685025755,
      model: "gpt-4",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
      choices: [
        {
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_1",
                type: "function",
                function: {
                  name: "func1",
                  arguments: '{"arg1": "value1"}',
                },
              },
              {
                id: "call_2",
                type: "function",
                function: {
                  name: "func2",
                  arguments: '{"arg2": "value2"}',
                },
              },
            ],
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    } as unknown as OpenAiResponse);
    
    const content = output.getResultContent();
    expect(content).toHaveLength(2);
    expect(content[0]).toEqual({
      type: "function_use",
      name: "func1",
      input: { arg1: "value1" },
      tool_call_id: "call_1"
    });
    expect(content[1]).toEqual({
      type: "function_use",
      name: "func2",
      input: { arg2: "value2" },
      tool_call_id: "call_2"
    });
  });

  it("throws error when tool call is missing function name", () => {
    const mockWithBadToolCall = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1685025755,
      model: "gpt-4",
      choices: [
        {
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                type: "function",
                function: {
                  // Missing name
                  arguments: "{}",
                },
              },
            ],
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    };

    expect(() => OutputOpenAIChat(mockWithBadToolCall as any)).toThrow(
      "Invalid tool call from OpenAI: missing function name"
    );
  });

  it("throws error when tool call has malformed JSON arguments", () => {
    const mockWithBadJSON = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1685025755,
      model: "gpt-4",
      choices: [
        {
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                type: "function",
                function: {
                  name: "test_func",
                  arguments: "{invalid json",
                },
              },
            ],
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    };

    expect(() => OutputOpenAIChat(mockWithBadJSON as any)).toThrow(
      'Invalid tool call from OpenAI: malformed JSON arguments in function "test_func"'
    );
  });

  it("handles empty choices array", () => {
    const mockEmptyChoices = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1685025755,
      model: "gpt-4",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 0,
        total_tokens: 10,
      },
      choices: [],
    };

    const output = OutputOpenAIChat(mockEmptyChoices as any);
    expect(output.getResultContent()).toEqual([]);
  });

  it("handles message with neither content nor tool_calls", () => {
    const mockNoContent = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1685025755,
      model: "gpt-4",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 0,
        total_tokens: 10,
      },
      choices: [
        {
          message: {
            role: "assistant",
            // No content or tool_calls
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    };

    const output = OutputOpenAIChat(mockNoContent as any);
    expect(output.getResultContent()).toEqual([]);
  });

  it("uses fallback model name when not provided", () => {
    const mockNoModel = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1685025755,
      // No model field
      choices: [
        {
          message: {
            role: "assistant",
            content: "Hello",
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    };

    const output = OutputOpenAIChat(mockNoModel as any);
    expect(output.getResult().name).toEqual("openai.unknown");
  });

  it("uses config model when response model is missing", () => {
    const mockNoModel = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1685025755,
      // No model field
      choices: [
        {
          message: {
            role: "assistant",
            content: "Hello",
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
    };

    const output = OutputOpenAIChat(mockNoModel as any, { model: "gpt-3.5-turbo" });
    expect(output.getResult().name).toEqual("gpt-3.5-turbo");
  });

  it("handles multiple choices with options", () => {
    const mockMultipleChoices = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1685025755,
      model: "gpt-4",
      choices: [
        {
          message: {
            role: "assistant",
            content: "First choice",
          },
          finish_reason: "stop",
          index: 0,
        },
        {
          message: {
            role: "assistant",
            content: "Second choice",
          },
          finish_reason: "stop",
          index: 1,
        },
        {
          message: {
            role: "assistant",
            tool_calls: [
              {
                type: "function",
                function: {
                  name: "option_func",
                  arguments: '{"opt": true}',
                },
              },
            ],
          },
          finish_reason: "stop",
          index: 2,
        },
      ],
    };

    const output = OutputOpenAIChat(mockMultipleChoices as any);
    const result = output.getResult();
    
    // First choice becomes main content
    expect(result.content).toEqual([
      { type: "text", text: "First choice" }
    ]);
    
    // Other choices become options
    expect(result.options).toHaveLength(2);
    expect(result.options[0]).toEqual([{
      type: "text",
      text: "Second choice"
    }]);
    expect(result.options[1]).toEqual([{
      type: "function_use",
      name: "option_func",
      input: { opt: true }
    }]);
  });

  it("handles empty message in formatResult", () => {
    const mockWithEmptyMessage = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1685025755,
      model: "gpt-4",
      choices: [
        {
          message: {
            role: "assistant",
            content: "Main",
          },
          finish_reason: "stop",
          index: 0,
        },
        {
          // Choice with empty/undefined message
          finish_reason: "stop",
          index: 1,
        },
      ],
    };

    const output = OutputOpenAIChat(mockWithEmptyMessage as any);
    const result = output.getResult();
    
    expect(result.content).toEqual([
      { type: "text", text: "Main" }
    ]);
    
    // Empty message should result in empty text
    expect(result.options).toHaveLength(1);
    expect(result.options[0]).toEqual([{
      type: "text",
      text: ""
    }]);
  });
});
