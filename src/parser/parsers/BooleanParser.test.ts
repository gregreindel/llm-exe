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
});

