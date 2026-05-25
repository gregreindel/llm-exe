
import { BaseParser, ReplaceStringTemplateParser } from "@/parser";
import { LlmExeError } from "@/utils/modules/errors";

/**
 * Tests the ReplaceStringTemplateParser class
 */
describe("llm-exe:parser/ReplaceStringTemplateParser", () => {
  it('creates class with expected properties', () => {
    const parser = new ReplaceStringTemplateParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(ReplaceStringTemplateParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("replaceStringTemplate")
  });
  it('removes hyphens', () => {
    const parser = new ReplaceStringTemplateParser()
    expect(parser.parse(`{{ replaceMe }}`, { replaceMe: "Hello World" })).toEqual("Hello World")
  });
  it("returns empty template exactly", () => {
    const parser = new ReplaceStringTemplateParser()
    expect(parser.parse("")).toEqual("")
  });
  it("returns whitespace template exactly", () => {
    const parser = new ReplaceStringTemplateParser()
    expect(parser.parse("   ")).toEqual("   ")
  });
  it("throws parser.parse_failed for invalid input type", () => {
    const parser = new ReplaceStringTemplateParser()
    try {
      parser.parse(null as any)
      fail("Expected an error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError)
      expect((e as LlmExeError).code).toEqual("parser.parse_failed")
      expect((e as LlmExeError).context).toEqual({
        operation: "ReplaceStringTemplateParser.parse",
        parser: "replaceStringTemplate",
        reason: "invalid_input_type",
        expected: "string",
        received: "null",
      })
    }
  });
  it("describes array invalid input type in parser context", () => {
    const parser = new ReplaceStringTemplateParser()
    try {
      parser.parse([] as any)
      fail("Expected an error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError)
      expect((e as LlmExeError).context).toMatchObject({
        reason: "invalid_input_type",
        received: "array",
      })
    }
  });
  it("describes number invalid input type in parser context", () => {
    const parser = new ReplaceStringTemplateParser()
    try {
      parser.parse(42 as any)
      fail("Expected an error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError)
      expect((e as LlmExeError).context).toMatchObject({
        reason: "invalid_input_type",
        received: "number",
      })
    }
  });
  it("throws parser.parse_failed for invalid attributes", () => {
    const parser = new ReplaceStringTemplateParser()
    try {
      parser.parse("Hello {{ name }}", null as any)
      fail("Expected an error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError)
      expect((e as LlmExeError).context).toEqual({
        operation: "ReplaceStringTemplateParser.parse",
        parser: "replaceStringTemplate",
        reason: "invalid_attributes",
        expected: "object",
        received: "null",
      })
    }
  });
  it("describes array invalid attributes in parser context", () => {
    const parser = new ReplaceStringTemplateParser()
    try {
      parser.parse("Hello {{ name }}", [] as any)
      fail("Expected an error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError)
      expect((e as LlmExeError).context).toMatchObject({
        reason: "invalid_attributes",
        received: "array",
      })
    }
  });
  it("describes primitive invalid attributes in parser context", () => {
    const parser = new ReplaceStringTemplateParser()
    try {
      parser.parse("Hello {{ name }}", "Greg" as any)
      fail("Expected an error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError)
      expect((e as LlmExeError).context).toMatchObject({
        reason: "invalid_attributes",
        received: "string",
      })
    }
  });
  it("wraps template replacement failures in parser.parse_failed", () => {
    const parser = new ReplaceStringTemplateParser()
    try {
      parser.parse("Hello {{#if name}}")
      fail("Expected an error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError)
      expect((e as LlmExeError).code).toEqual("parser.parse_failed")
      expect((e as LlmExeError).context).toMatchObject({
        operation: "ReplaceStringTemplateParser.parse",
        parser: "replaceStringTemplate",
        reason: "template_replacement_failed",
        inputLength: 18,
      })
      expect((e as Error & { cause?: unknown }).cause).toBeInstanceOf(Error)
    }
  });
});
