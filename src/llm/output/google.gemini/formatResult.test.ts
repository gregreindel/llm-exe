import { formatResult } from "./formatResult";

describe("formatResult", () => {
  it("returns text fallback if result is undefined", () => {
    const output = formatResult(undefined as any);
    expect(output).toEqual({ type: "text", text: "" });
  });

  it("returns text fallback if content is undefined", () => {
    const result = { content: undefined } as any;
    const output = formatResult(result);
    expect(output).toEqual({ type: "text", text: "" });
  });

  it("returns text fallback if parts is empty", () => {
    const result = { content: { parts: [] } } as any;
    const output = formatResult(result);
    expect(output).toEqual({ type: "text", text: "" });
  });

  it("returns text fallback if parts has length > 1", () => {
    const result = {
      content: {
        parts: [
          { text: "Part 1" },
          { text: "Part 2" },
        ],
      },
    } as any;
    const output = formatResult(result);
    expect(output).toEqual({ type: "text", text: "" });
  });

  it("returns function_use object if parts length = 1 with valid functionCall JSON", () => {
    const argsObj = { foo: 123 };
    const result = {
      content: {
        parts: [
          {
            functionCall: {
              name: "testFunction",
              args: JSON.stringify(argsObj),
            },
          },
        ],
      },
    } as any;
    const output = formatResult(result);
    expect(output).toEqual({
      type: "function_use",
      name: "testFunction",
      input: { foo: 123 },
    });
  });

  it("throws an error if functionCall args is invalid JSON", () => {
    const result = {
      content: {
        parts: [
          {
            functionCall: {
              name: "testFunction",
              args: "{ invalid JSON }",
            },
          },
        ],
      },
    } as any;
    expect(() => formatResult(result)).toThrow();
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
    expect(output).toEqual({
      type: "text",
      text: "Hello world",
    });
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
    expect(output).toEqual({
      type: "text",
      text: "some text",
    });
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
    expect(output).toEqual({
      type: "text",
      text: "",
    });
  });
});