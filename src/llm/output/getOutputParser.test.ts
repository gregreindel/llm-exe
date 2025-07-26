import { normalizeLlmOutputToInternalFormat } from "@/llm/output";

describe("normalizeLlmOutputToInternalFormat", () => {
  it("should return OutputOpenAIChat for 'openai' provider", () => {
    const response = { data: "exampleData" };
    const result = normalizeLlmOutputToInternalFormat(
      { key: "openai.chat.v1" },
      response
    );
    expect(result).toBeInstanceOf(Object);
  });

  it("should return OutputAnthropicClaude3Chat for 'anthropic' provider", () => {
    const response = { data: "exampleData" };
    const result = normalizeLlmOutputToInternalFormat(
      { key: "anthropic.chat.v1" },
      response
    );
    expect(result).toBeInstanceOf(Object);
  });

  it("should return OutputAnthropicClaude3Chat for 'amazon.anthropic.v3' provider", () => {
    const response = { data: "exampleData" };
    const result = normalizeLlmOutputToInternalFormat(
      { key: "amazon:anthropic.chat.v1" },
      response
    );
    expect(result).toBeInstanceOf(Object);
  });

  it("should return OutputMetaLlama3Chat for 'amazon.meta.v3' provider", () => {
    const response = { data: "exampleData" };
    const result = normalizeLlmOutputToInternalFormat(
      { key: "amazon:meta.chat.v1" },
      response
    );
    expect(result).toBeInstanceOf(Object);
  });

  it("should return OutputXAIChat for 'amazon.meta.v3' provider", () => {
    const response = { data: "exampleData" };
    const result = normalizeLlmOutputToInternalFormat(
      { key: "xai.chat.v1" },
      response
    );
    expect(result).toBeInstanceOf(Object);
  });

  it("should return OutputOllamaChat for 'ollama.chat.v1' provider", () => {
    const response = `${JSON.stringify({ data: "exampleData" })}\n${JSON.stringify({ data: "exampleData", done: true })}`;
    const result = normalizeLlmOutputToInternalFormat(
      { key: "ollama.chat.v1" },
      response
    );
    expect(result).toBeInstanceOf(Object);
  });

  it("should return OutputGoogleGeminiChat for 'google' provider", () => {
    const response = { data: "exampleData" };
    const result = normalizeLlmOutputToInternalFormat(
      { key: "google.chat.v1" },
      response
    );
    expect(result).toBeInstanceOf(Object);
  });

  it("should return OutputOpenAIChat for 'deepseek' provider", () => {
    const response = { data: "exampleData" };
    const result = normalizeLlmOutputToInternalFormat(
      { key: "deepseek.chat.v1" },
      response
    );
    expect(result).toBeInstanceOf(Object);
  });

  it("should throw an error for unsupported provider", () => {
    const response = { data: "exampleData" };
    expect(() =>
      normalizeLlmOutputToInternalFormat("unsupported" as any, response)
    ).toThrowError("Unsupported provider");
  });

  it("should return default for custom", () => {
    const response = { data: "exampleData" };
    const result = normalizeLlmOutputToInternalFormat(
      { key: "custom:meta.chat.v1" } as any,
      response
    );
    expect(result).toBeInstanceOf(Object);
  });
});
