import {
  LlmNativeFunctionParser,
  OpenAiFunctionParser,
} from "./LlmNativeFunctionParser";
import { StringParser } from "./StringParser";

describe("llm-exe:parser/LlmNativeFunctionParser", () => {
  const parser = new LlmNativeFunctionParser({
    parser: new StringParser(),
  });

  it("creates class with expected properties", () => {
    expect(parser.parser).toBeInstanceOf(StringParser);
    expect(parser.name).toEqual("openAiFunction");
  });

  it("parses simple string correctly when no function", () => {
    expect(parser.parse([{ type: "text", text: "ok" }])).toEqual("ok");
  });

  it("parses single function call correctly", () => {
    expect(
      parser.parse([
        {
          type: "function_use",
          name: "test_function",
          input: { foo: "bar" },
        },
      ])
    ).toEqual({
      name: "test_function",
      arguments: { foo: "bar" },
    });
  });

  it("preserves tool_call_id when present", () => {
    const result = parser.parse([
      {
        type: "function_use",
        name: "test_function",
        input: { foo: "bar" },
        tool_call_id: "call_123",
      },
    ]);
    expect(result).toEqual({
      name: "test_function",
      arguments: { foo: "bar" },
      tool_call_id: "call_123",
    });
  });

  it("returns first function call by default when multiple present", () => {
    const result = parser.parse([
      {
        type: "function_use",
        name: "function1",
        input: { arg: "val1" },
      },
      {
        type: "function_use",
        name: "function2",
        input: { arg: "val2" },
      },
    ]);
    expect(result).toEqual({
      name: "function1",
      arguments: { arg: "val1" },
    });
  });

  it("returns all function calls when multiple: true", () => {
    const multiParser = new LlmNativeFunctionParser({
      parser: new StringParser(),
      multiple: true,
    });
    const result = multiParser.parse([
      {
        type: "function_use",
        name: "function1",
        input: { arg: "val1" },
        tool_call_id: "call_1",
      },
      {
        type: "function_use",
        name: "function2",
        input: { arg: "val2" },
        tool_call_id: "call_2",
      },
    ]);
    expect(result).toEqual([
      {
        name: "function1",
        arguments: { arg: "val1" },
        tool_call_id: "call_1",
      },
      {
        name: "function2",
        arguments: { arg: "val2" },
        tool_call_id: "call_2",
      },
    ]);
  });

  it("handles mixed content with text and functions", () => {
    const result = parser.parse([
      { type: "text", text: "Here's the weather:" },
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
    const result = parser.parse([
      {
        type: "function_use",
        name: "test",
        // @ts-expect-error type
        input: '{"key": "value"}',
      },
    ]);
    expect(result).toEqual({
      name: "test",
      arguments: { key: "value" },
    });
  });
});

describe("llm-exe:parser/OpenAiFunctionParser (deprecated)", () => {
  let originalWarn: any;
  beforeEach(() => {
    originalWarn = console.warn;
    console.warn = jest.fn();
  });
  afterEach(() => {
    console.warn = originalWarn;
  });

  it("is an alias for LlmNativeFunctionParser", () => {
    expect(OpenAiFunctionParser).toBe(LlmNativeFunctionParser);
  });

  it("works the same as LlmNativeFunctionParser", () => {
    const parser = new OpenAiFunctionParser({ parser: new StringParser() });
    expect(
      parser.parse([
        {
          type: "function_use",
          name: "test_function",
          input: {},
        },
      ])
    ).toMatchObject({ name: "test_function", arguments: {} });
  });
});
