import { OutputMetaLlama3Chat } from "@/llm/output/llama";

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
    expect(output).toHaveProperty("stopReason");
    expect(output).toHaveProperty("options");
  });

  it("creates output with correct content", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output.content).toEqual([
      { type: "text", text: "This is the assistant message content." },
    ]);
  });

  it("returns correct stopReason", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output.stopReason).toEqual("end_turn");
  });

  it("returns empty options array", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output.options).toEqual([]);
  });

  it("calculates usage correctly", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output.usage).toEqual({
      output_tokens: 1,
      input_tokens: 427,
      total_tokens: 428,
    });
  });

  it("uses default model name 'meta' when no config provided", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output.name).toBe("meta");
  });

  it("uses config default model when provided", () => {
    const config = {
      options: {
        model: {
          default: "meta.llama3-70b-instruct-v1:0",
        },
      },
    };
    const output = OutputMetaLlama3Chat(mock, config as any);
    expect(output.name).toBe("meta.llama3-70b-instruct-v1:0");
  });

  it("generates a unique id", () => {
    const output1 = OutputMetaLlama3Chat(mock);
    const output2 = OutputMetaLlama3Chat(mock);
    expect(output1.id).toBeDefined();
    expect(typeof output1.id).toBe("string");
    expect(output1.id).not.toBe(output2.id);
  });

  it("sets created as a timestamp", () => {
    const before = new Date().getTime();
    const output = OutputMetaLlama3Chat(mock);
    const after = new Date().getTime();
    expect(output.created).toBeGreaterThanOrEqual(before);
    expect(output.created).toBeLessThanOrEqual(after);
  });

  it("returns complete output structure", () => {
    const output = OutputMetaLlama3Chat(mock);
    expect(output).toEqual({
      id: expect.any(String),
      name: "meta",
      created: expect.any(Number),
      usage: { input_tokens: 427, output_tokens: 1, total_tokens: 428 },
      stopReason: "end_turn",
      content: [{ type: "text", text: "This is the assistant message content." }],
      options: [],
    });
  });

  it("handles empty generation string", () => {
    const emptyMock = { ...mock, generation: "" };
    const output = OutputMetaLlama3Chat(emptyMock);
    expect(output.content).toEqual([{ type: "text", text: "" }]);
  });

  it("handles zero token counts", () => {
    const zeroTokenMock = {
      ...mock,
      prompt_token_count: 0,
      generation_token_count: 0,
    };
    const output = OutputMetaLlama3Chat(zeroTokenMock);
    expect(output.usage).toEqual({
      output_tokens: 0,
      input_tokens: 0,
      total_tokens: 0,
    });
  });

  it("handles different stop reasons", () => {
    const maxTokensMock = { ...mock, stop_reason: "max_gen_len" };
    const output = OutputMetaLlama3Chat(maxTokensMock);
    expect(output.stopReason).toBe("max_gen_len");
  });
});
