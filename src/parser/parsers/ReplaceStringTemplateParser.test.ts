
import { BaseParser, ReplaceStringTemplateParser } from "@/parser";

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
});

