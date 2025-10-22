import { BaseLlmOutput } from "./base";
import { OutputResult, OutputResultContent } from "@/interfaces";

describe("llm-exe:output/BaseLlmOutput", () => {
  const mockResult: Omit<OutputResult, "id" | "created" | "options"> = {
    name: "test-model",
    usage: {
      input_tokens: 10,
      output_tokens: 20,
      total_tokens: 30,
    },
    stopReason: "stop",
    content: [
      {
        type: "text",
        text: "Test content",
      },
    ],
  };

  it("creates output with expected properties", () => {
    const output = BaseLlmOutput(mockResult);
    expect(output).toHaveProperty("getResult");
    expect(output).toHaveProperty("getResultContent");
    expect(output).toHaveProperty("getResultText");
  });

  it("generates UUID when id is not provided", () => {
    const output = BaseLlmOutput(mockResult);
    const result = output.getResult();
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");
  });

  it("uses provided id when available", () => {
    const mockWithId = { ...mockResult, id: "custom-id" };
    const output = BaseLlmOutput(mockWithId);
    const result = output.getResult();
    expect(result.id).toBe("custom-id");
  });

  it("generates timestamp when created is not provided", () => {
    const output = BaseLlmOutput(mockResult);
    const result = output.getResult();
    expect(result.created).toBeDefined();
    expect(typeof result.created).toBe("number");
  });

  it("uses provided created timestamp", () => {
    const customTime = 1234567890;
    const mockWithCreated = { ...mockResult, created: customTime };
    const output = BaseLlmOutput(mockWithCreated);
    const result = output.getResult();
    expect(result.created).toBe(customTime);
  });

  it("handles empty options array", () => {
    const output = BaseLlmOutput(mockResult);
    const result = output.getResult();
    expect(result.options).toEqual([]);
  });

  it("preserves provided options", () => {
    const mockOptions = [[{ type: "text", text: "option1" } as OutputResultContent]];
    const mockWithOptions = { ...mockResult, options: mockOptions };
    const output = BaseLlmOutput(mockWithOptions);
    const result = output.getResult();
    expect(result.options).toEqual(mockOptions);
  });

  it("getResultContent delegates to util function", () => {
    const output = BaseLlmOutput(mockResult);
    // Test with index
    const content1 = output.getResultContent(0);
    expect(content1).toBeDefined();
    // Test without index
    const content2 = output.getResultContent();
    expect(content2).toBeDefined();
  });

  it("getResultText delegates to util function", () => {
    const output = BaseLlmOutput(mockResult);
    // Test with index
    const text1 = output.getResultText(0);
    expect(text1).toBeDefined();
    // Test without index
    const text2 = output.getResultText();
    expect(text2).toBeDefined();
  });

  it("returns frozen result object", () => {
    const output = BaseLlmOutput(mockResult);
    const result1 = output.getResult();
    const result2 = output.getResult();
    expect(result1).toEqual(result2);
    expect(result1).not.toBe(result2); // Different object references
  });
});