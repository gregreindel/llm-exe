import { BaseParser, FunctionCallParser, StringParser, JsonParser } from "@/parser";

/**
 * Tests the FunctionCallParser class
 */
describe("llm-exe:parser/FunctionCallParser", () => {
  it("creates class with expected properties", () => {
    const parser = new FunctionCallParser({ parser: new StringParser() });
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toBeInstanceOf(FunctionCallParser);
    expect(parser).toHaveProperty("name");
    expect(parser.name).toEqual("openAiFunction");
  });

  it("parses simple string correctly when no function", () => {
    const parser = new FunctionCallParser({ parser: new StringParser() });
    expect(parser.parse([{ text: "Hello", type: "text" }])).toEqual("Hello");
  });

  it("parses single function call correctly", () => {
    const parser = new FunctionCallParser({ parser: new StringParser() });
    expect(
      parser.parse([
        {
          type: "function_use",
          name: "test_function",
          input: {},
        },
      ])
    ).toEqual({
      name: "test_function",
      arguments: {},
    });
  });

  it("preserves tool_call_id when present", () => {
    const parser = new FunctionCallParser({ parser: new StringParser() });
    expect(
      parser.parse([
        {
          type: "function_use",
          name: "test_function",
          input: { foo: "bar" },
          tool_call_id: "call_abc123",
        },
      ])
    ).toEqual({
      name: "test_function",
      arguments: { foo: "bar" },
      tool_call_id: "call_abc123",
    });
  });

  it("returns first function call by default when multiple present", () => {
    const parser = new FunctionCallParser({ parser: new StringParser() });
    const result = parser.parse([
      {
        type: "function_use",
        name: "first_function",
        input: { order: 1 },
      },
      {
        type: "function_use",
        name: "second_function",
        input: { order: 2 },
      },
    ]);

    expect(result).toEqual({
      name: "first_function",
      arguments: { order: 1 },
    });
  });

  it("returns all function calls when multiple: true", () => {
    const parser = new FunctionCallParser({
      parser: new StringParser(),
      multiple: true,
    });
    const result = parser.parse([
      {
        type: "function_use",
        name: "first_function",
        input: { order: 1 },
        tool_call_id: "call_123",
      },
      {
        type: "function_use",
        name: "second_function",
        input: { order: 2 },
        tool_call_id: "call_456",
      },
    ]);

    expect(result).toEqual([
      {
        name: "first_function",
        arguments: { order: 1 },
        tool_call_id: "call_123",
      },
      {
        name: "second_function",
        arguments: { order: 2 },
        tool_call_id: "call_456",
      },
    ]);
  });

  it("handles mixed content with text and functions", () => {
    const parser = new FunctionCallParser({ parser: new StringParser() });
    const result = parser.parse([
      {
        type: "text",
        text: "Let me help you with that.",
      },
      {
        type: "function_use",
        name: "get_weather",
        input: { location: "NYC" },
      },
    ]);

    expect(result).toEqual({
      name: "get_weather",
      arguments: { location: "NYC" },
    });
  });

  it("parses JSON string arguments", () => {
    const parser = new FunctionCallParser({ parser: new StringParser() });
    expect(
      parser.parse([
        {
          type: "function_use",
          name: "test_function",
          // @ts-expect-error String
          input: '{"foo": "bar"}', // String JSON
        },
      ])
    ).toEqual({
      name: "test_function",
      arguments: { foo: "bar" }, // Parsed object
    });
  });

  it("returns array when multiple mode is enabled", () => {
    const parser = new FunctionCallParser({ 
      parser: new StringParser(),
      multiple: true 
    });
    
    const result = parser.parse([
      {
        type: "function_use",
        name: "func1",
        input: { a: 1 },
      },
      {
        type: "function_use",
        name: "func2",
        input: { b: 2 },
        tool_call_id: "call_123",
      }
    ]);
    
    expect(result).toEqual([
      {
        name: "func1",
        arguments: { a: 1 },
        tool_call_id: undefined
      },
      {
        name: "func2", 
        arguments: { b: 2 },
        tool_call_id: "call_123"
      }
    ]);
  });

  it("uses fallback parser when no function calls", () => {
    const fallbackParser = new JsonParser();
    const parser = new FunctionCallParser({ 
      parser: fallbackParser 
    });
    
    const result = parser.parse([
      { type: "text", text: '{"result": "no function here"}' }
    ]);
    
    expect(result).toEqual({ result: "no function here" });
  });

  it("uses fallback parser when content array is empty", () => {
    const fallbackParser = new StringParser();
    const parser = new FunctionCallParser({ 
      parser: fallbackParser 
    });
    
    const result = parser.parse([]);
    
    expect(result).toBe("");
  });
});

/**
 * Tests the deprecated OpenAiFunctionParser alias
 */
describe("llm-exe:parser/OpenAiFunctionParser (deprecated)", () => {
  // Mock console.warn for deprecation warning test
  const originalWarn = console.warn;
  beforeEach(() => {
    console.warn = jest.fn();
  });
  afterEach(() => {
    console.warn = originalWarn;
  });

  it("shows deprecation warning", async () => {
    // Dynamic import to test the deprecated export
    // @ts-expect-error import
    const { OpenAiFunctionParser } = await import("./FunctionCallParser");
    new OpenAiFunctionParser({ parser: new StringParser() });
    expect(console.warn).toHaveBeenCalledWith(
      "OpenAiFunctionParser is deprecated. Use FunctionCallParser instead."
    );
  });

  it("works the same as FunctionCallParser", async () => {
    // @ts-expect-error import
    const { OpenAiFunctionParser } = await import("./FunctionCallParser");
    const parser = new OpenAiFunctionParser({ parser: new StringParser() });
    expect(
      parser.parse([
        {
          type: "function_use",
          name: "test_function",
          input: {},
        },
      ])
    ).toEqual({
      name: "test_function",
      arguments: {},
    });
  });
});
