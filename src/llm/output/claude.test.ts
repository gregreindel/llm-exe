import { OutputAnthropicClaude3Chat } from "@/llm/output/claude";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:output/OutputAnthropicClaude3Chat", () => {
  const mock = {
    id: "chatcmpl-7KfsdfdsfZj1waHPfsdEZ",
    model: "claude-3-5-sonnet-20240620",
    type: "message",
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: 427,
      total_tokens: 428,
      output_tokens: 1,
    },
    content: [
      {
        type: "text",
        text: "This is the assistant message content.",
      },
    ],
  };

  it("creates class with expected properties", () => {
    const output = OutputAnthropicClaude3Chat(mock as any).getResult();
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates class with expected properties", () => {
    const output = OutputAnthropicClaude3Chat(mock as any).getResult();
    expect((output as any).id).toEqual(mock.id);
    expect((output as any).name).toEqual(mock.model);
    expect((output as any).content).toEqual(mock.content);
    expect((output as any).usage).toEqual({
      input_tokens: 427,
      output_tokens: 1,
      total_tokens: 428  // Fixed: was 854 (input * 2), now correct as input + output
    });
  });
  it("creates class with expected methods", () => {
    const output = OutputAnthropicClaude3Chat(mock as any);
    expect(output).toHaveProperty("getResult");
    expect(typeof output.getResult).toEqual("function");
    expect(output).toHaveProperty("getResultText");
    expect(typeof output.getResultText).toEqual("function");
    expect(output).toHaveProperty("getResult");
    expect(typeof output.getResult).toEqual("function");
    expect(output).toHaveProperty("getResultContent");
    expect(typeof output.getResultContent).toEqual("function");
  });
  it("getResultText gets result", () => {
    const output = OutputAnthropicClaude3Chat(mock as any);
    expect(output.getResultText()).toEqual(
      "This is the assistant message content."
    );
  });
  it("getResultContent gets [] if not exists", () => {
    const output = OutputAnthropicClaude3Chat(mock as any);
    expect(output.getResultContent(8)).toEqual([]);
  });

  const mock_tools = {
    id: "msg_01HwEDvPa9f1cjZanHVrZdG3",
    type: "message",
    role: "assistant",
    model: "claude-3-5-sonnet-20240620",
    content: [
      {
        type: "text",
        text: "Certainly!",
      },
      {
        type: "tool_use",
        id: "toolu_01EJ17EQLV15S2b45FHD1t6w",
        name: "move",
        input: {
          direction: "right",
        },
      },
    ],
    stop_reason: "tool_use",
    stop_sequence: null,
    usage: {
      input_tokens: 418,
      output_tokens: 124,
    },
  };

  it("getResultContent gets [] if not exists", () => {
    const output = OutputAnthropicClaude3Chat(mock_tools as any);
    expect(output.getResultContent()).toMatchObject([
      { type: "text", text: "Certainly!" },
      { type: "function_use", name: "move", input: { direction: "right" } },
      // tool_call_id is optional and may be present
    ]);
  });
});
