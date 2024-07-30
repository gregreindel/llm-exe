import { BaseLlmOutput, OutputMetaLlama3Chat } from "@/llm/output";

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
    const output = new OutputMetaLlama3Chat(mock);
    expect(output).toBeInstanceOf(BaseLlmOutput);
    expect(output).toBeInstanceOf(OutputMetaLlama3Chat);
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("results");
    expect(output).toHaveProperty("usage");
  });
  it("creates class with expected properties", () => {
    const output = new OutputMetaLlama3Chat(mock);
    expect((output as any).results).toEqual([{text: mock.generation}]);
  });
  it("creates class with expected methods", () => {
    const output = new OutputMetaLlama3Chat(mock);
    expect(output).toBeInstanceOf(BaseLlmOutput);
    expect(output).toBeInstanceOf(OutputMetaLlama3Chat);
    expect(output).toHaveProperty("getResults");
    expect(typeof output.getResults).toEqual("function");
    expect(output).toHaveProperty("setResult");
    expect(typeof output.setResult).toEqual("function");
    expect(output).toHaveProperty("getResult");
    expect(typeof output.getResult).toEqual("function");
    expect(output).toHaveProperty("getResultContent");
    expect(typeof output.getResultContent).toEqual("function");
  });
  it("getResultContent gets result", () => {
    const output = new OutputMetaLlama3Chat(mock);
    expect(output.getResultContent()).toEqual(
      "This is the assistant message content."
    );
  });

  it("getResultContent gets undefined if not exists", () => {
    const output = new OutputMetaLlama3Chat(mock);
    expect(output.getResultContent(8)).toEqual(undefined);
  });

});