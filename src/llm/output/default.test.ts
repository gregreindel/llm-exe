import { BaseLlmOutput2 } from "@/llm/output/base";
import { OutputDefault } from "@/llm/output/default";

jest.mock("@/llm/output/base", () => ({
  BaseLlmOutput2: jest.fn(),
}));

describe("OutputDefault", () => {
  const BaseLlmOutput2Mock = BaseLlmOutput2 as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    BaseLlmOutput2Mock.mockClear()
  });

  it("should handle default stopReason and model name", () => {
    const result = {
      text: "sample text",
    };
    const config = {};

    OutputDefault(result, config);

    expect(BaseLlmOutput2Mock).toHaveBeenCalledWith({
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
    const config = { model: "gpt-3" };

    OutputDefault(result as any, config);

    expect(BaseLlmOutput2Mock).toHaveBeenCalledWith({
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
    const config = { model: "custom-model" };

    OutputDefault(result, config);

    expect(BaseLlmOutput2Mock).toHaveBeenCalledWith({
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
    const config = { model: "api-model" };

    OutputDefault(result, config);

    expect(BaseLlmOutput2Mock).toHaveBeenCalledWith({
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
    const config = { model: "test-model" };

    OutputDefault(result as any, config);

    expect(BaseLlmOutput2Mock).toHaveBeenCalledWith({
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
    const result = undefined
    const config = {};

    OutputDefault(result as any, config);

    expect(BaseLlmOutput2Mock).toHaveBeenCalledWith({
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
