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
  it('parses multi-digit numbers', () => {
    const parser = new NumberParser()
    expect(parser.parse("42")).toEqual(42)
    expect(parser.parse("100")).toEqual(100)
    expect(parser.parse("1234567")).toEqual(1234567)
  });
  it('parses decimal numbers', () => {
    const parser = new NumberParser()
    expect(parser.parse("3.14")).toEqual(3.14)
    expect(parser.parse("0.5")).toEqual(0.5)
  });
  it('parses negative numbers', () => {
    const parser = new NumberParser()
    expect(parser.parse("-7")).toEqual(-7)
    expect(parser.parse("-3.14")).toEqual(-3.14)
  });
  it('extracts number from surrounding text', () => {
    const parser = new NumberParser()
    expect(parser.parse("The answer is 42.")).toEqual(42)
    expect(parser.parse("Score: 99 points")).toEqual(99)
  });
  it('returns -1 if no number found', () => {
    const parser = new NumberParser()
    expect(parser.parse("No Number")).toEqual(-1)
  })
});

