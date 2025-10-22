import { OutputDefault } from "@/llm/output/default";

describe("OutputDefault", () => {

  it("should handle default stopReason and model name", () => {
    const result = {
      text: "sample text",
    };
    const config = undefined;

    const output = OutputDefault(result, config);

    expect(output).toEqual({
      name: "unknown",
      stopReason: "stop",
      content: [{ type: "text", text: "sample text" }],
      usage: {
        output_tokens: 0,
        input_tokens: 0,
        total_tokens: 0,
      },
    });
  });

  it("should use provided model name and stopReason", () => {
    const result = {
      stopReason: "stop",
      text: "another sample",
      output_tokens: 10,
      input_tokens: 15,
    };
    const config = { options: { model: { default: "gpt-3" } } };

    const output = OutputDefault(result as any, config as any);

    expect(output).toEqual({
      name: "gpt-3",
      stopReason: "stop",
      content: [{ type: "text", text: "another sample" }],
      usage: {
        output_tokens: 10,
        input_tokens: 15,
        total_tokens: 25,
      },
    });
  });

  it("should handle missing output_tokens and input_tokens", () => {
    const result = {
      text: "text without tokens",
    };
    const config = { options: { model: { default: "custom-model" } } };

    const output = OutputDefault(result, config as any);

    expect(output).toEqual({
      name: "custom-model",
      stopReason: "stop",
      content: [{ type: "text", text: "text without tokens" }],
      usage: {
        output_tokens: 0,
        input_tokens: 0,
        total_tokens: 0,
      },
    });
  });

  it("should handle missing stopReason but with model name", () => {
    const result = {
      text: "text with model",
      output_tokens: 5,
      input_tokens: 10,
    };
    const config = { options: { model: { default: "api-model" } } };

    const output = OutputDefault(result, config as any);

    expect(output).toEqual({
      name: "api-model",
      stopReason: "stop",
      content: [{ type: "text", text: "text with model" }],
      usage: {
        output_tokens: 5,
        input_tokens: 10,
        total_tokens: 15,
      },
    });
  });

  it("should handle zero output_tokens and input_tokens", () => {
    const result = {
      stopReason: "stop",
      text: "zero tokens",
      output_tokens: 0,
      input_tokens: 0,
    };
    const config = { options: { model: { default: "test-model" } } };

    const output = OutputDefault(result as any, config as any);

    expect(output).toEqual({
      name: "test-model",
      stopReason: "stop",
      content: [{ type: "text", text: "zero tokens" }],
      usage: {
        output_tokens: 0,
        input_tokens: 0,
        total_tokens: 0,
      },
    });
  });

  it("should handle malformed", () => {
    const result = undefined;
    const config = undefined;

    const output = OutputDefault(result as any, config);

    expect(output).toEqual({
      name: "unknown",
      stopReason: "stop",
      content: [],
      usage: {
        output_tokens: 0,
        input_tokens: 0,
        total_tokens: 0,
      },
    });
  });
});
