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

  it("handles stringified JSON input", () => {
    const parser = new MarkdownCodeBlocksParser();
    const codeContent = `const x = 1;`;
    const markdownContent = `\`\`\`js\n${codeContent}\n\`\`\``;
    // Create a stringified JSON object
    const jsonInput = JSON.stringify({ content: markdownContent });
    
    const result = parser.parse(jsonInput);
    expect(result).toEqual([
      { code: `${codeContent}\n`, language: 'js' }
    ]);
  });

  it("handles multiple code blocks in stringified JSON", () => {
    const parser = new MarkdownCodeBlocksParser();
    const code1 = `function hello() { return "world"; }`;
    const code2 = `print("hello")`;
    const markdownContent = `Some text\n\`\`\`javascript\n${code1}\n\`\`\`\n\nMore text\n\`\`\`python\n${code2}\n\`\`\``;
    const jsonInput = JSON.stringify({ result: markdownContent });
    
    const result = parser.parse(jsonInput);
    expect(result).toEqual([
      { code: `${code1}\n`, language: 'javascript' },
      { code: `${code2}\n`, language: 'python' }
    ]);
  });
});
