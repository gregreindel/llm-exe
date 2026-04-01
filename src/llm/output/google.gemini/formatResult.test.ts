import { formatResult } from "./formatResult";

describe("formatResult", () => {
  it("returns text fallback if result is undefined", () => {
    const output = formatResult(undefined as any);
    expect(output).toEqual([]);
  });

  it("returns text fallback if content is undefined", () => {
    const result = { content: undefined } as any;
    const output = formatResult(result);
    expect(output).toEqual([]);
  });

  it("returns text fallback if parts is empty", () => {
    const result = { content: { parts: [] } } as any;
    const output = formatResult(result);
    expect(output).toEqual([]);
  });

  it("returns text fallback if parts has length > 1", () => {
    const result = {
      content: {
        parts: [{ text: "Part 1" }, { text: "Part 2" }],
      },
    } as any;
    const output = formatResult(result);
    expect(output).toEqual([
      { type: "text", text: "Part 1" },
      { type: "text", text: "Part 2" },
    ]);
  });

  it("returns function_use object if parts length = 1 with valid functionCall", () => {
    const argsObj = { foo: 123 };
    const result = {
      content: {
        parts: [
          {
            functionCall: {
              name: "testFunction",
              args: argsObj,
            },
          },
        ],
      },
    } as any;
    const output = formatResult(result);
    expect(output).toEqual([
      {
        functionId: expect.any(String),
        type: "function_use",
        name: "testFunction",
        input: { foo: 123 },
      },
    ]);
  });

  it("returns text if parts length = 1 but no functionCall", () => {
    const result = {
      content: {
        parts: [
          {
            text: "Hello world",
          },
        ],
      },
    } as any;
    const output = formatResult(result);
    expect(output).toEqual([
      {
        type: "text",
        text: "Hello world",
      },
    ]);
  });

  it("returns text if parts length = 1 but functionCall is not an object", () => {
    const result = {
      content: {
        parts: [
          {
            functionCall: "not an object",
            text: "some text",
          },
        ],
      },
    } as any;
    const output = formatResult(result);
    expect(output).toEqual([
      {
        type: "text",
        text: "some text",
      },
    ]);
  });

  it("returns text with empty string if parts length = 1 but text is missing", () => {
    const result = {
      content: {
        parts: [
          {
            functionCall: undefined,
          },
        ],
      },
    } as any;
    const output = formatResult(result);
    expect(output).toEqual([]);
  });

  it("uses provided id in functionId when id argument is given", () => {
    const result = {
      content: {
        parts: [
          {
            functionCall: {
              name: "myFunc",
              args: { key: "value" },
            },
          },
        ],
      },
    } as any;
    const output = formatResult(result, "custom-id");
    expect(output).toEqual([
      {
        functionId: "custom-id-0",
        type: "function_use",
        name: "myFunc",
        input: { key: "value" },
      },
    ]);
  });

  it("uses provided id with correct index for multiple function calls", () => {
    const result = {
      content: {
        parts: [
          { text: "Some text" },
          {
            functionCall: {
              name: "func1",
              args: { a: 1 },
            },
          },
          {
            functionCall: {
              name: "func2",
              args: { b: 2 },
            },
          },
        ],
      },
    } as any;
    const output = formatResult(result, "resp-123");
    expect(output).toEqual([
      { type: "text", text: "Some text" },
      {
        functionId: "resp-123-1",
        type: "function_use",
        name: "func1",
        input: { a: 1 },
      },
      {
        functionId: "resp-123-2",
        type: "function_use",
        name: "func2",
        input: { b: 2 },
      },
    ]);
  });

  it("generates uuid-based functionId when no id is provided", () => {
    const result = {
      content: {
        parts: [
          {
            functionCall: {
              name: "testFunc",
              args: {},
            },
          },
        ],
      },
    } as any;
    const output = formatResult(result);
    expect(output).toHaveLength(1);
    expect(output[0].type).toBe("function_use");
    // functionId should be a uuid + "-0" pattern
    expect(output[0]).toHaveProperty("functionId");
    expect((output[0] as any).functionId).toMatch(/-0$/);
  });

  it("handles functionCall with string args (JSON string)", () => {
    const result = {
      content: {
        parts: [
          {
            functionCall: {
              name: "parseFunc",
              args: '{"key":"value"}',
            },
          },
        ],
      },
    } as any;
    const output = formatResult(result, "test-id");
    expect(output).toHaveLength(1);
    expect(output[0].type).toBe("function_use");
    expect((output[0] as any).input).toEqual({ key: "value" });
  });
});
