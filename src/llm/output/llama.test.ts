import { OutputMetaLlama3Chat } from "@/llm/output/llama";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:output/OutputMetaLlama3Chat", () => {
  const mock = {
    stop_reason: "end_turn",
    prompt_token_count: 427,
    generation_token_count: 1,
    generation: "This is the assistant message content.",
  };
  it("creates class with expected properties", () => {
    const output = OutputMetaLlama3Chat(mock).getResult()
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates class with expected properties", () => {
    const output = OutputMetaLlama3Chat(mock).getResult()
    expect((output as any).content).toEqual([{ type: "text", text: mock.generation}]);
  });
  it("creates class with expected methods", () => {
    const output = OutputMetaLlama3Chat(mock);
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
    const output = OutputMetaLlama3Chat(mock);
    expect(output.getResultText()).toEqual(
      "This is the assistant message content."
    );
  });

  it("getResultContent gets [] if not exists", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output.getResultContent(8)).toEqual([]);
  });

});