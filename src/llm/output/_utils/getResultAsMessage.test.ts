import { OutputResultContent } from "@/interfaces";
import { getResultAsMessage } from "@/llm/output/_utils/getResultAsMessage";

describe("getResultAsMessage", () => {
  it("should return a message with role 'assistant' and content from single text item", () => {
    const input: OutputResultContent[] = [{ type: "text", text: "Hello" }];
    const expected = { role: "assistant", content: "Hello" };

    const result = getResultAsMessage(input);

    expect(result).toEqual(expected);
  });

  it("should return a message with role 'assistant', content null, and function_call from single function_use item", () => {
    const functionItem: OutputResultContent = {
      type: "function_use",
      name: "testFunction",
      input: {},
    };
    const input = [functionItem];
    const expected = {
      role: "assistant",
      content: null,
      function_call: JSON.stringify(functionItem),
    };

    const result = getResultAsMessage(input);

    expect(result).toEqual(expected);
  });

  it("should return a message with role 'assistant', content from text item, and function_call from function_use item", () => {
    const input: OutputResultContent[] = [
      { type: "text", text: "Hello" },
      { type: "function_use", name: "testFunction", input: {} },
    ];
    const expected = {
      role: "assistant",
      content: "Hello",
      function_call: JSON.stringify({
        type: "function_use",
        name: "testFunction",
        input: {}
      }),
    };

    const result = getResultAsMessage(input);

    expect(result).toEqual(expected);
  });

  it("should throw an error for invalid mixed content types", () => {
    const input: OutputResultContent[] = [
      { type: "text", text: "Hello" },
      { type: "text", text: "World" },
    ];

    expect(() => getResultAsMessage(input)).toThrow("Invalid response");
  });

  it("should throw an error for unsupported number of items", () => {
    const input: OutputResultContent[] = [
      { type: "text", text: "Hello" },
      { type: "function_use", name: "testFunction", input: {} },
      { type: "text", text: "World" },
    ];

    expect(() => getResultAsMessage(input)).toThrow("Invalid response");
  });

  it("should handle empty text content", () => {
    const input: OutputResultContent[] = [{ type: "text", text: "" }];
    const expected = { role: "assistant", content: "" };

    const result = getResultAsMessage(input);

    expect(result).toEqual(expected);
  });

  it("should throw an error for empty array", () => {
    const input: OutputResultContent[] = [];

    expect(() => getResultAsMessage(input)).toThrow("Invalid response");
  });

  it("should throw an error for unsupported content type", () => {
    const input: OutputResultContent[] = [
      { type: "unsupported_type" as any, content: "Test" } as any,
    ];

    expect(() => getResultAsMessage(input)).toThrow("Invalid response");
  });
});
