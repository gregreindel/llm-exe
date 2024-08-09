import { BaseParser, NumberParser } from "@/parser";

/**
 * Tests the NumberParser class
 */
describe("llm-exe:parser/NumberParser", () => {
  it('creates class with expected properties', () => {
    const parser = new NumberParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(NumberParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("number")
  })
  it('parses simple string correctly', () => {
    const parser = new NumberParser()
    expect(parser.parse("1")).toEqual(1)
  });
  it('returns -1 if no number found', () => {
    const parser = new NumberParser()
    expect(parser.parse("No Number")).toEqual(-1)
  })
});

