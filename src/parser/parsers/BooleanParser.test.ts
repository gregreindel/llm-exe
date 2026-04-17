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
  it('parses "true" as true', () => {
    const parser = new BooleanParser()
    expect(parser.parse("true")).toEqual(true)
  })
  it('parses "True" as true (case-insensitive)', () => {
    const parser = new BooleanParser()
    expect(parser.parse("True")).toEqual(true)
  })
  it('parses "yes" as true', () => {
    const parser = new BooleanParser()
    expect(parser.parse("yes")).toEqual(true)
  })
  it('parses "Yes" as true (case-insensitive)', () => {
    const parser = new BooleanParser()
    expect(parser.parse("Yes")).toEqual(true)
  })
  it('parses "y" as true', () => {
    const parser = new BooleanParser()
    expect(parser.parse("y")).toEqual(true)
  })
  it('parses "1" as true', () => {
    const parser = new BooleanParser()
    expect(parser.parse("1")).toEqual(true)
  })
  it('parses "false" as false', () => {
    const parser = new BooleanParser()
    expect(parser.parse("false")).toEqual(false)
  })
  it('parses "no" as false', () => {
    const parser = new BooleanParser()
    expect(parser.parse("no")).toEqual(false)
  })
  it('parses "0" as false', () => {
    const parser = new BooleanParser()
    expect(parser.parse("0")).toEqual(false)
  })
  it('parses "n" as false', () => {
    const parser = new BooleanParser()
    expect(parser.parse("n")).toEqual(false)
  })
  it('handles whitespace around value', () => {
    const parser = new BooleanParser()
    expect(parser.parse("  yes  ")).toEqual(true)
  })
  it('parses "FALSE" as false (uppercase)', () => {
    const parser = new BooleanParser()
    expect(parser.parse("FALSE")).toEqual(false)
  })
  it('parses "Y" as true (uppercase)', () => {
    const parser = new BooleanParser()
    expect(parser.parse("Y")).toEqual(true)
  })
  it('parses "TRUE" as true (all caps)', () => {
    const parser = new BooleanParser()
    expect(parser.parse("TRUE")).toEqual(true)
  })
  it('returns false for unrecognized strings', () => {
    const parser = new BooleanParser()
    expect(parser.parse("maybe")).toEqual(false)
    expect(parser.parse("absolutely")).toEqual(false)
    expect(parser.parse("2")).toEqual(false)
    expect(parser.parse("")).toEqual(false)
  })
  it('throws on non-string input', () => {
    const parser = new BooleanParser()
    expect(() => parser.parse(42 as any)).toThrow("Invalid input. Expected string.")
    expect(() => parser.parse(null as any)).toThrow("Invalid input. Expected string.")
    expect(() => parser.parse(undefined as any)).toThrow("Invalid input. Expected string.")
  })
  it('handles whitespace-only input as false', () => {
    const parser = new BooleanParser()
    expect(parser.parse("   ")).toEqual(false)
  })
  it('handles tab and newline whitespace', () => {
    const parser = new BooleanParser()
    expect(parser.parse("\ttrue\n")).toEqual(true)
    expect(parser.parse("\n1\t")).toEqual(true)
  })
  it('accepts options in constructor', () => {
    const parser = new BooleanParser({})
    expect(parser).toBeInstanceOf(BooleanParser)
    expect(parser.name).toEqual("boolean")
  })
});

