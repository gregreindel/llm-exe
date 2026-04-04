/**
 * Scenario: Parser edge cases through the full pipeline.
 *
 * Tests parsers with tricky inputs via the executor pipeline using the mock LLM.
 * The mock LLM echoes back the prompt content, so we craft prompts that
 * produce parseable output when echoed.
 */
import { useLlm } from "@/llm";
import { createChatPrompt } from "@/prompt";
import { createParser, createCustomParser } from "@/parser";
import { createLlmExecutor } from "@/executor/_functions";
import { BaseLlmOutput } from "@/llm/output/base";
import {
  TEXT_EMPTY,
  TEXT_WHITESPACE,
  STOP_MAX_TOKENS,
  STOP_CONTENT_FILTER,
  TEXT_WITH_JSON_ARRAY,
  TEXT_WITH_CODE_BLOCK,
  FUNCTION_CALL_COMPLEX_INPUT,
  PARSER_INPUTS,
} from "./mock.scenarios";

// ─── StringExtractParser scenarios ───────────────────────────────────

describe("Scenario: StringExtractParser integration", () => {
  it("extracts a matching enum value from LLM text", () => {
    const parser = createParser("stringExtract", {
      enum: ["positive", "negative", "neutral"],
    });
    expect(parser.parse("The sentiment is clearly positive here.")).toEqual(
      "positive"
    );
  });

  it("returns the first matching enum value when multiple match", () => {
    const parser = createParser("stringExtract", {
      enum: ["yes", "no", "maybe"],
    });
    // "maybe" contains no other enum values, but "yes" appears first in enum list
    expect(parser.parse("yes, maybe")).toEqual("yes");
  });

  it("throws when no enum value matches", () => {
    const parser = createParser("stringExtract", {
      enum: ["cat", "dog"],
    });
    expect(() => parser.parse("The animal is a fish.")).toThrow(
      "No matching enum value found"
    );
  });

  it("supports case-insensitive matching", () => {
    const parser = createParser("stringExtract", {
      enum: ["approve", "reject"],
      ignoreCase: true,
    });
    expect(parser.parse("I APPROVE this request.")).toEqual("approve");
  });

  it("works end-to-end with mock LLM executor", async () => {
    const llm = useLlm("openai.chat-mock.v1", { model: "mock" });
    const prompt = createChatPrompt("positive");
    const parser = createParser("stringExtract", {
      enum: ["positive", "negative", "neutral"],
    });
    const executor = createLlmExecutor({ llm, prompt, parser });
    const result = await executor.execute({});
    expect(result).toEqual("positive");
  });
});

// ─── Parser behavior with edge-case OutputResult shapes ──────────────

describe("Scenario: Parsers with edge-case outputs", () => {
  it("JsonParser handles JSON array text", () => {
    const parser = createParser("json");
    const wrapped = BaseLlmOutput(TEXT_WITH_JSON_ARRAY);
    const text = wrapped.getResultText();
    const result = parser.parse(text);
    expect(result).toEqual([
      { id: 1, task: "Buy groceries" },
      { id: 2, task: "Walk the dog" },
    ]);
  });

  it("JsonParser attempts to recover from malformed JSON", () => {
    const parser = createParser("json");
    // The JSON parser tries to extract what it can from malformed input
    const result = parser.parse(PARSER_INPUTS.invalidJson);
    expect(result).toBeDefined();
    expect(typeof result).toEqual("object");
  });

  it("NumberParser handles float strings", () => {
    const parser = createParser("number");
    expect(parser.parse(PARSER_INPUTS.float)).toEqual(3.14);
  });

  it("NumberParser handles text with embedded number", () => {
    const parser = createParser("number");
    expect(parser.parse("The answer is 42.")).toEqual(42);
  });

  it("BooleanParser handles 'yes' as true", () => {
    const parser = createParser("boolean");
    expect(parser.parse(PARSER_INPUTS.booleanYes)).toEqual(true);
  });

  it("ListToArrayParser handles numbered lists", () => {
    const parser = createParser("listToArray");
    const result = parser.parse(PARSER_INPUTS.numberedList);
    expect(result).toEqual(["First item", "Second item", "Third item"]);
  });

  it("MarkdownCodeBlockParser extracts from code block output", () => {
    const parser = createParser("markdownCodeBlock");
    const wrapped = BaseLlmOutput(TEXT_WITH_CODE_BLOCK);
    const text = wrapped.getResultText();
    const result = parser.parse(text);
    expect(result).toEqual({
      language: "typescript",
      code: 'function add(a: number, b: number): number {\n  return a + b;\n}\n',
    });
  });

  it("StringParser preserves whitespace-only output", () => {
    const parser = createParser("string");
    const wrapped = BaseLlmOutput(TEXT_WHITESPACE);
    const text = wrapped.getResultText();
    expect(parser.parse(text)).toEqual("   \n\n  ");
  });
});

// ─── BaseLlmOutput edge cases ────────────────────────────────────────

describe("Scenario: BaseLlmOutput edge cases", () => {
  it("getResultText returns empty string for empty content", () => {
    const wrapped = BaseLlmOutput(TEXT_EMPTY);
    expect(wrapped.getResultText()).toEqual("");
  });

  it("preserves stopReason for max_tokens", () => {
    const wrapped = BaseLlmOutput(STOP_MAX_TOKENS);
    const result = wrapped.getResult();
    expect(result.stopReason).toEqual("max_tokens");
    expect(wrapped.getResultText()).toEqual(
      "This response was cut off because"
    );
  });

  it("preserves stopReason for content_filter", () => {
    const wrapped = BaseLlmOutput(STOP_CONTENT_FILTER);
    const result = wrapped.getResult();
    expect(result.stopReason).toEqual("content_filter");
  });

  it("exposes function call with complex nested input", () => {
    const wrapped = BaseLlmOutput(FUNCTION_CALL_COMPLEX_INPUT);
    const content = wrapped.getResultContent();
    expect(content).toHaveLength(1);
    if (content[0].type === "function_use") {
      expect(content[0].input.metadata.tags).toEqual(["urgent", "review"]);
      expect(content[0].input.metadata.nested.deep.value).toBe(true);
    }
  });
});

// ─── CustomParser in executor pipeline ───────────────────────────────

describe("Scenario: CustomParser standalone", () => {
  it("transforms output with custom csv-split logic", () => {
    const parser = createCustomParser("csv-split", (input: string) =>
      input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    const result = parser.parse("apple, banana, cherry", {} as any);
    expect(result).toEqual(["apple", "banana", "cherry"]);
  });

  it("custom parser can return structured objects", () => {
    const parser = createCustomParser("json-transform", (input: string) => {
      const obj = JSON.parse(input);
      return { ...obj, processed: true };
    });
    const result = parser.parse('{"name":"test","value":42}', {} as any);
    expect(result).toEqual({ name: "test", value: 42, processed: true });
  });

  it("custom parser error propagates", () => {
    const parser = createCustomParser("failing", () => {
      throw new Error("Custom parser failed");
    });
    expect(() => parser.parse("anything", {} as any)).toThrow(
      "Custom parser failed"
    );
  });
});

// ─── Executor error propagation ──────────────────────────────────────

describe("Scenario: Executor error handling", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "mock" });

  it("propagates parser errors through executor", async () => {
    const prompt = createChatPrompt("not a number at all");
    const parser = createParser("stringExtract", {
      enum: ["XYZZY", "PLUGH"],
    });
    const executor = createLlmExecutor({ llm, prompt, parser });
    // Mock LLM echoes something that doesn't match enum values
    await expect(executor.execute({})).rejects.toThrow();
  });

  it("onError hook receives parser errors", async () => {
    const onError = jest.fn();
    const prompt = createChatPrompt("not valid json {{{");
    const parser = createParser("json");
    const executor = createLlmExecutor(
      { llm, prompt, parser },
      { hooks: { onError } }
    );

    await expect(executor.execute({})).rejects.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
