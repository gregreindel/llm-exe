import { BaseParser, MarkdownCodeBlockParser } from "@/parser";

/**
 * Tests the MarkdownCodeBlock class
 */
describe("llm-exe:parser/MarkdownCodeBlock", () => {
  it("creates class with expected properties", () => {
    const parser = new MarkdownCodeBlockParser();
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toBeInstanceOf(MarkdownCodeBlockParser);
    expect(parser).toHaveProperty("name");
    expect(parser.name).toEqual("markdownCodeBlock");
  });
  it("parses simple string correctly", () => {
    const parser = new MarkdownCodeBlockParser();
    const code = `const input = "test";\n`;
    const language = `typescript`;
    const markdown = `\`\`\`${language}\n${code}\`\`\``;

    expect(parser.parse(markdown)).toEqual({ code, language });
  });

  it("returns correct structure if nothing found", () => {
    const parser = new MarkdownCodeBlockParser();
    const markdown = `nothing here`;
    expect(parser.parse(markdown)).toEqual({ code: "", language: "" });
  });
  it("parses code block without language specifier", () => {
    const parser = new MarkdownCodeBlockParser();
    const markdown = "```\nsome code\n```";
    const result = parser.parse(markdown);
    expect(result.code).toEqual("some code\n");
    expect(result.language).toEqual("");
  });
  it("returns first block when multiple code blocks exist", () => {
    const parser = new MarkdownCodeBlockParser();
    const markdown = "```js\nfirst\n```\n\n```python\nsecond\n```";
    const result = parser.parse(markdown);
    expect(result.language).toEqual("js");
    expect(result.code).toEqual("first\n");
  });
  it("parses code block with language but empty code", () => {
    const parser = new MarkdownCodeBlockParser();
    const markdown = "```typescript\n```";
    const result = parser.parse(markdown);
    expect(result.language).toEqual("typescript");
    expect(result.code).toEqual("");
  });
  it("returns empty for empty string input", () => {
    const parser = new MarkdownCodeBlockParser();
    expect(parser.parse("")).toEqual({ code: "", language: "" });
  });
  it("parses code block with multiline content", () => {
    const parser = new MarkdownCodeBlockParser();
    const code = "line1\nline2\nline3\n";
    const markdown = "```json\n" + code + "```";
    const result = parser.parse(markdown);
    expect(result.language).toEqual("json");
    expect(result.code).toEqual(code);
  });
});
