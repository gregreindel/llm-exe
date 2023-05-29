import { BaseParser, StringParser } from "@/parser";

/**
 * Tests the StringParser class
 */
describe("llm-exe:parser/StringParser", () => {
  it('creates class with expected properties', () => {
    const parser = new StringParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(StringParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("string")
  })
  it('parses simple string correctly', () => {
    const parser = new StringParser()
    expect(parser.parse("Hello")).toEqual("Hello")
  })
  it('parses array to string', () => {
    const parser = new StringParser();
    const badValue = ["Hello"] as unknown as string;
    expect(() => parser.parse(badValue)).toThrow("Invalid input. Expected string. Received object.")

  })
  it('parses object to string', () => {
    const parser = new StringParser();
    const badValue = {hello: "world"} as unknown as string;
    expect(() => parser.parse(badValue)).toThrow("Invalid input. Expected string. Received object.")
  })
});

