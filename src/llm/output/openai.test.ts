import { OutputOpenAIChat } from "./openai";

describe("OutputOpenAIChat", () => {
  const baseResponse = {
    id: "chatcmpl-123",
    object: "chat.completion",
    model: "gpt-4o-mini",
    created: 1700000000,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "Hello, world!",
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 5,
      total_tokens: 15,
    },
  };

  it("parses a standard text response", () => {
    const output = OutputOpenAIChat(baseResponse as any);
    expect(output).toEqual({
      id: "chatcmpl-123",
      name: "gpt-4o-mini",
      created: 1700000000,
      stopReason: "stop",
      content: [{ type: "text", text: "Hello, world!" }],
      options: [],
      usage: {
        input_tokens: 10,
        output_tokens: 5,
        total_tokens: 15,
      },
    });
  });

  it("parses a response with tool calls", () => {
    const response = {
      ...baseResponse,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_abc123",
                type: "function",
                function: {
                  name: "get_weather",
                  arguments: '{"location": "NYC"}',
                },
              },
            ],
          },
          finish_reason: "tool_calls",
        },
      ],
    };

    const output = OutputOpenAIChat(response as any);
    expect(output.content).toEqual([
      {
        type: "function_use",
        functionId: "call_abc123",
        name: "get_weather",
        input: { location: "NYC" },
      },
    ]);
    expect(output.stopReason).toBe("tool_calls");
  });

  it("parses a response with both text and tool calls", () => {
    const response = {
      ...baseResponse,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Let me check the weather.",
            tool_calls: [
              {
                id: "call_xyz",
                type: "function",
                function: {
                  name: "get_weather",
                  arguments: '{"city": "London"}',
                },
              },
            ],
          },
          finish_reason: "tool_calls",
        },
      ],
    };

    const output = OutputOpenAIChat(response as any);
    expect(output.content).toHaveLength(2);
    expect(output.content[0]).toEqual({
      type: "text",
      text: "Let me check the weather.",
    });
    expect(output.content[1]).toEqual({
      type: "function_use",
      functionId: "call_xyz",
      name: "get_weather",
      input: { city: "London" },
    });
  });

  it("parses multiple tool calls", () => {
    const response = {
      ...baseResponse,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_1",
                type: "function",
                function: { name: "get_weather", arguments: '{"city": "NYC"}' },
              },
              {
                id: "call_2",
                type: "function",
                function: { name: "get_time", arguments: '{"timezone": "EST"}' },
              },
            ],
          },
          finish_reason: "tool_calls",
        },
      ],
    };

    const output = OutputOpenAIChat(response as any);
    expect(output.content).toHaveLength(2);
    expect((output.content[0] as any).name).toBe("get_weather");
    expect((output.content[1] as any).name).toBe("get_time");
  });

  it("handles multiple choices (options)", () => {
    const response = {
      ...baseResponse,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "First choice" },
          finish_reason: "stop",
        },
        {
          index: 1,
          message: { role: "assistant", content: "Second choice" },
          finish_reason: "stop",
        },
      ],
    };

    const output = OutputOpenAIChat(response as any);
    expect(output.content).toEqual([{ type: "text", text: "First choice" }]);
    expect(output.options).toHaveLength(1);
  });

  it("falls back to config model name when response model is missing", () => {
    const response = { ...baseResponse, model: undefined };
    const config = { options: { model: { default: "gpt-4" } } };

    const output = OutputOpenAIChat(response as any, config as any);
    expect(output.name).toBe("gpt-4");
  });

  it("falls back to openai.unknown when no model info available", () => {
    const response = { ...baseResponse, model: undefined };
    const output = OutputOpenAIChat(response as any);
    expect(output.name).toBe("openai.unknown");
  });

  it("handles empty choices array", () => {
    const response = { ...baseResponse, choices: [] };
    const output = OutputOpenAIChat(response as any);
    expect(output.content).toEqual([]);
    expect(output.options).toEqual([]);
  });

  it("handles missing usage data", () => {
    const response = { ...baseResponse, usage: undefined };
    const output = OutputOpenAIChat(response as any);
    expect(output.usage).toEqual({
      input_tokens: undefined,
      output_tokens: undefined,
      total_tokens: undefined,
    });
  });

  it("handles tool call with non-JSON arguments", () => {
    const response = {
      ...baseResponse,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_1",
                type: "function",
                function: { name: "echo", arguments: "plain text not json" },
              },
            ],
          },
          finish_reason: "tool_calls",
        },
      ],
    };

    const output = OutputOpenAIChat(response as any);
    expect(output.content[0]).toEqual({
      type: "function_use",
      functionId: "call_1",
      name: "echo",
      input: {},
    });
  });

  it("preserves response id and created timestamp", () => {
    const output = OutputOpenAIChat(baseResponse as any);
    expect(output.id).toBe("chatcmpl-123");
    expect(output.created).toBe(1700000000);
  });
});
