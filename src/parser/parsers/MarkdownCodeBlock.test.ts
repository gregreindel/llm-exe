import { BaseParser, MarkdownCodeBlockParser } from "@/parser";

/**
 * Tests the MarkdownCodeBlock class
 */
describe("llm-exe:parser/MarkdownCodeBlock", () => {
  it('creates class with expected properties', () => {
    const parser = new MarkdownCodeBlockParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(MarkdownCodeBlockParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("markdownCodeBlock")
  })
  it('parses simple string correctly', () => {
    const parser = new MarkdownCodeBlockParser()
    const code = `const input = "test";`
    const language = `typescript`
    const markdown = `\`\`\`${language}\n${code}\n\`\`\``;

    expect(parser.parse(markdown)).toEqual({ code,language  })
  })
});

