
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
    }
  });
});
