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
  it("creates output with expected properties", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("content");
    expect(output).toHaveProperty("usage");
  });
  it("creates output with correct values", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output.content).toEqual([{ type: "text", text: mock.generation}]);
  });
  it("formats content correctly", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output.content).toEqual([
      {
        type: "text",
        text: "This is the assistant message content.",
      },
    ]);
    expect(output.stopReason).toEqual("end_turn");
  });


});