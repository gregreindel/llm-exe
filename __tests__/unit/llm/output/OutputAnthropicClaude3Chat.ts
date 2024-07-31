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
      total_tokens: 854,
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
    const output = OutputAnthropicClaude3Chat(mock as any).getResult()
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates class with expected properties", () => {
    const output = OutputAnthropicClaude3Chat(mock as any).getResult()
    expect((output as any).id).toEqual(mock.id);
    expect((output as any).name).toEqual(mock.model);
    expect((output as any).content).toEqual(mock.content);
    expect((output as any).usage).toEqual(mock.usage);
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


});
