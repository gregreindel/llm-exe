import { OutputAnthropicClaude3Chat, OutputMetaLlama3Chat, OutputOpenAIChat, getOutputParser } from "@/llm/output";

describe("getOutputParser", () => {
  it("should return OutputOpenAIChat for 'openai' provider", () => {
    const response = { data: "exampleData" };
    const result = getOutputParser("openai", response);
    expect(result).toBeInstanceOf(OutputOpenAIChat);
  });

  it("should return OutputAnthropicClaude3Chat for 'anthropic' provider", () => {
    const response = { data: "exampleData" };
    const result = getOutputParser("anthropic", response);
    expect(result).toBeInstanceOf(OutputAnthropicClaude3Chat);
  });

  it("should return OutputAnthropicClaude3Chat for 'amazon.anthropic.v3' provider", () => {
    const response = { data: "exampleData" };
    const result = getOutputParser("amazon.anthropic.v3", response);
    expect(result).toBeInstanceOf(OutputAnthropicClaude3Chat);
  });

  it("should return OutputMetaLlama3Chat for 'amazon.meta.v3' provider", () => {
    const response = { data: "exampleData" };
    const result = getOutputParser("amazon.meta.v3", response);
    expect(result).toBeInstanceOf(OutputMetaLlama3Chat);
  });

  it("should throw an error for unsupported provider", () => {
    const response = { data: "exampleData" };
    expect(() => getOutputParser("unsupported", response)).toThrowError("Unsupported provider");
  });
});