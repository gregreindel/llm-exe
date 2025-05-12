import { BaseParser, MarkdownCodeBlocksParser } from "@/parser";

/**
 * Tests the MarkdownCodeBlock class
 */
describe("llm-exe:parser/MarkdownCodeBlocks", () => {
  it("creates class with expected properties", () => {
    const parser = new MarkdownCodeBlocksParser();
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toBeInstanceOf(MarkdownCodeBlocksParser);
    expect(parser).toHaveProperty("name");
    expect(parser.name).toEqual("markdownCodeBlocks");
  });
  it("parses simple string correctly", () => {
    const parser = new MarkdownCodeBlocksParser();
    const code = `const input = "test";\n`;
    const language = `typescript`;
    const markdown = `\`\`\`${language}\n${code}\`\`\``;

    expect(parser.parse(`${markdown}\n\n${markdown}`)).toEqual([
      { code, language },
      { code, language },
    ]);
  });

  it("returns correct structure if nothing found", () => {
    const parser = new MarkdownCodeBlocksParser();
    const markdown = `nothing here`;
    expect(parser.parse(markdown)).toEqual([]);
  });
});
