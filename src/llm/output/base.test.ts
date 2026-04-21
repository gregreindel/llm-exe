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

  it("copies content array so mutations don't affect internal state", () => {
    const content = [{ type: "text" as const, text: "original" }];
    const output = BaseLlmOutput({ ...mockResult, content });
    content.push({ type: "text" as const, text: "mutated" });
    const result = output.getResult();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toBe("original");
  });

  it("copies options array so mutations don't affect internal state", () => {
    const options = [[{ type: "text" as const, text: "opt1" } as OutputResultContent]];
    const output = BaseLlmOutput({ ...mockResult, options });
    options.push([{ type: "text" as const, text: "mutated" } as OutputResultContent]);
    const result = output.getResult();
    expect(result.options).toHaveLength(1);
  });

  it("handles multiple content items", () => {
    const multiContent = {
      ...mockResult,
      content: [
        { type: "text" as const, text: "First" },
        { type: "text" as const, text: "Second" },
        { type: "text" as const, text: "Third" },
      ],
    };
    const output = BaseLlmOutput(multiContent);
    const result = output.getResult();
    expect(result.content).toHaveLength(3);
    expect(result.content[0].text).toBe("First");
    expect(result.content[2].text).toBe("Third");
  });

  it("getResultText returns primary content text without index", () => {
    const output = BaseLlmOutput(mockResult);
    expect(output.getResultText()).toBe("Test content");
    expect(output.getResultText(0)).toBe("Test content");
  });

  it("getResultText returns option text for index > 0", () => {
    const withOptions = {
      ...mockResult,
      options: [
        [{ type: "text" as const, text: "unused" }],
        [{ type: "text" as const, text: "Option 1" }],
      ] as OutputResultContent[][],
    };
    const output = BaseLlmOutput(withOptions);
    expect(output.getResultText(1)).toBe("Option 1");
  });

  it("getResultText returns empty string for missing option index", () => {
    const output = BaseLlmOutput(mockResult);
    expect(output.getResultText(5)).toBe("");
  });

  it("preserves all result fields accurately", () => {
    const fullResult = {
      id: "test-id-123",
      name: "gpt-4",
      created: 9999999,
      usage: { input_tokens: 5, output_tokens: 15, total_tokens: 20 },
      stopReason: "length" as const,
      options: [] as OutputResultContent[][],
      content: [{ type: "text" as const, text: "response" }],
    };
    const output = BaseLlmOutput(fullResult);
    const result = output.getResult();
    expect(result.id).toBe("test-id-123");
    expect(result.name).toBe("gpt-4");
    expect(result.created).toBe(9999999);
    expect(result.usage.input_tokens).toBe(5);
    expect(result.usage.output_tokens).toBe(15);
    expect(result.stopReason).toBe("length");
  });

  it("handles undefined options gracefully", () => {
    const noOptions = { ...mockResult, options: undefined };
    const output = BaseLlmOutput(noOptions as any);
    const result = output.getResult();
    expect(result.options).toEqual([]);
  });
});