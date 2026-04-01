import { GenericFunctionCall } from "@/interfaces";
import { formatContent, formatOptions, normalizeFinishReason, normalizeFunctionCall } from "@/llm/output/_util";

describe("normalizeFunctionCall", () => {
  it("should return 'required' for input 'any' and provider 'openai'", () => {
    const result = normalizeFunctionCall("any", "openai");
    expect(result).toBe("required");
  });

  it("should return input for input 'any' and provider 'anthropic'", () => {
    const input: GenericFunctionCall = "any";
    const result = normalizeFunctionCall(input, "anthropic");
    expect(result).toBe(input);
  });

  it("should return input for any other inputs", () => {
    const input: any = "test";
    const result = normalizeFunctionCall(input, "openai");
    expect(result).toBe(input);
  });

  it("should return input for input 'any' and provider 'google'", () => {
    const result = normalizeFunctionCall("any", "google");
    expect(result).toBe("any");
  });

  it("should return 'auto' unchanged for all providers", () => {
    expect(normalizeFunctionCall("auto", "openai")).toBe("auto");
    expect(normalizeFunctionCall("auto", "anthropic")).toBe("auto");
    expect(normalizeFunctionCall("auto", "google")).toBe("auto");
  });

  it("should return 'none' unchanged for all providers", () => {
    expect(normalizeFunctionCall("none", "openai")).toBe("none");
    expect(normalizeFunctionCall("none", "anthropic")).toBe("none");
    expect(normalizeFunctionCall("none", "google")).toBe("none");
  });

  it("should return object function call unchanged", () => {
    const input = { name: "myFunction" } as GenericFunctionCall;
    expect(normalizeFunctionCall(input, "openai")).toBe(input);
    expect(normalizeFunctionCall(input, "anthropic")).toBe(input);
    expect(normalizeFunctionCall(input, "google")).toBe(input);
  });
});

describe("normalizeFinishReason", () => {
  it("should return 'stop' for input 'stop'", () => {
    const result = normalizeFinishReason("stop");
    expect(result).toBe("stop");
  });

  it("should return 'stop' for input 'end_turn'", () => {
    const result = normalizeFinishReason("end_turn");
    expect(result).toBe("stop");
  });

  it("should return 'tool' for input 'tool_use'", () => {
    const result = normalizeFinishReason("tool_use");
    expect(result).toBe("tool");
  });

  it("should return 'unknown' for any other input", () => {
    const result = normalizeFinishReason("random_input");
    expect(result).toBe("unknown");
  });
});

describe("formatOptions", () => {
  const handler = (i: any) => (i % 2 === 0 ? { content: i } : null);

  it("should format response items that pass handler check", () => {
    const response = [1, 2, 3, 4];
    const result = formatOptions(response, handler);
    expect(result).toEqual([[{ content: 2 }], [{ content: 4 }]]);
  });

  it("should return empty array if none of the items pass handler check", () => {
    const response = [1, 3, 5];
    const result = formatOptions(response, handler);
    expect(result).toEqual([]);
  });

  it("should return empty array if response is empty", () => {
    const response: any[] = [];
    const result = formatOptions(response, handler);
    expect(result).toEqual([]);
  });
});

describe("formatContent", () => {
  const handler = (i: any) => (i === 4 ? { content: i } : null);

  it("should format content if it passes handler check", () => {
    const response = 4;
    const result = formatContent(response, handler);
    expect(result).toEqual([{ content: 4 }]);
  });

  it("should return empty array if content does not pass handler check", () => {
    const response = 5;
    const result = formatContent(response, handler);
    expect(result).toEqual([]);
  });
});