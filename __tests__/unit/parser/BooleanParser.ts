import { BaseParser, BooleanParser } from "@/parser";

/**
 * Tests the BooleanParser class
 */
describe("llm-exe:parser/BooleanParser", () => {
  it('creates class with expected properties', () => {
    const parser = new BooleanParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(BooleanParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("boolean")
  })
  it('parses simple string correctly', () => {
    const parser = new BooleanParser()
    expect(parser.parse("true")).toEqual(true)
  })
  it('parses simple string correctly', () => {
    const parser = new BooleanParser()
    expect(parser.parse("false")).toEqual(false)
  })
});

