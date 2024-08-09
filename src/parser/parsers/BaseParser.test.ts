import { BaseParser } from "@/parser";
import { BaseParserOptions } from "@/types";
import { maybeParseJSON } from "@/utils";

/**
 * Tests the BaseParser class
 */
describe("llm-exe:parser/BaseParser", () => {
  class MockParser<T extends { name: string; age: number }> extends BaseParser {
    constructor(options?: BaseParserOptions) {
      super("mock-parser", options);
    }
  
    parse(text: string, _attributes?: T) {
      const parsed = maybeParseJSON(text);
      return parsed;
    }
  }
  it('creates class with expected properties', () => {
    const parser = new MockParser()
    expect(parser).toBeInstanceOf(MockParser)
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("mock-parser")
  })
  it('parses simple string correctly', () => {
    const parser = new MockParser()
    expect(parser.parse(JSON.stringify({ age: 90, name: "Greg" }))).toEqual({ age: 90, name: "Greg" })
  })
});

