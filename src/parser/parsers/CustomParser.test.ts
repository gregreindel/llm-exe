import { BaseParser, CustomParser, createCustomParser } from "@/parser";

describe("llm-exe:parser/createParser", () => {
  it("can create custom parser", () => {
    const parser = new CustomParser("custom-parser-name", (text, _input) => {
      return text.replace("old", "new");
    });
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toHaveProperty("name");
    expect(parser.name).toEqual("custom-parser-name");
  });
  it("can create custom parser", () => {
    const parser = createCustomParser("custom-parser-name", (text, _input) => {
      return text.replace("old", "new");
    });
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toHaveProperty("name");
    expect(parser.name).toEqual("custom-parser-name");
  });
  it("custom parser returns result", () => {
    const parser = new CustomParser("custom-parser-name", (text, _input) => {
      return text.replace("old", "new");
    });
    expect(parser.parse(`old text`, {} as any)).toEqual("new text");
  });
});


