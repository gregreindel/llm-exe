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
    const code = `const data = { x: 1 };
`;
    const language = `javascript`;
    const markdown = `\`\`\`${language}\n${code}\`\`\``;
    
    // Create a stringified object with the markdown content
    const jsonInput = JSON.stringify({ result: markdown });
    
    expect(parser.parse(jsonInput)).toEqual([
      { code, language },
    ]);
  });

  it("handles stringified JSON with multiple code blocks", () => {
    const parser = new MarkdownCodeBlocksParser();
    const code1 = `const x = 1;
`;
    const code2 = `const y = 2;
`;
    const markdown = `Here's code:\n\`\`\`js\n${code1}\`\`\`\n\nMore code:\n\`\`\`python\n${code2}\`\`\``;
    
    // Create a stringified object
    const jsonInput = JSON.stringify({ response: markdown });
    
    expect(parser.parse(jsonInput)).toEqual([
      { code: code1, language: "js" },
      { code: code2, language: "python" },
    ]);
  });
});
