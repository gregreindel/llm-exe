import { BaseParser, ListToKeyValueParser } from "@/parser";
import { LlmExeError } from "@/utils/modules/errors";

/**
 * Tests the ListToKeyValueParser class
 */
describe("llm-exe:parser/ListToKeyValueParser", () => {
  it('creates class with expected properties', () => {
    const parser = new ListToKeyValueParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(ListToKeyValueParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("listToKeyValue")
  })
  it('parses simple string correctly', () => {
    const parser = new ListToKeyValueParser()
    const input = `tool_name_1: Tool description 1\ntool_name_2: Tool description 2`
    expect(parser.parse(input)).toEqual([{ key: "tool_name_1", value: "Tool description 1"},{ key: "tool_name_2", value: "Tool description 2"}])
  })
  it('preserves colons in values', () => {
    const parser = new ListToKeyValueParser()
    const input = `URL: https://example.com/a:b`
    expect(parser.parse(input)).toEqual([{ key: "URL", value: "https://example.com/a:b" }])
  })
  it('preserves duplicate keys', () => {
    const parser = new ListToKeyValueParser()
    const input = `Name: Greg\nName: Bob`
    expect(parser.parse(input)).toEqual([{ key: "Name", value: "Greg" }, { key: "Name", value: "Bob" }])
  })
  it('accepts empty values', () => {
    const parser = new ListToKeyValueParser()
    expect(parser.parse("Name:")).toEqual([{ key: "Name", value: "" }])
  })
  it('strips shared list markers', () => {
    const parser = new ListToKeyValueParser()
    expect(parser.parse("- Name: Greg\n* Role: Dev\n1. URL: https://example.com")).toEqual([
      { key: "Name", value: "Greg" },
      { key: "Role", value: "Dev" },
      { key: "URL", value: "https://example.com" },
    ])
  })
  it('throws parser.parse_failed for malformed lines', () => {
    const parser = new ListToKeyValueParser()
    try {
      parser.parse("Name Greg")
      fail("Expected an error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError)
      expect((e as LlmExeError).context).toMatchObject({
        operation: "ListToKeyValueParser.parse",
        parser: "listToKeyValue",
        reason: "malformed_line",
      })
    }
  })
  it('throws parser.parse_failed for empty keys', () => {
    const parser = new ListToKeyValueParser()
    try {
      parser.parse(": Greg")
      fail("Expected an error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError)
      expect((e as LlmExeError).context).toMatchObject({
        operation: "ListToKeyValueParser.parse",
        parser: "listToKeyValue",
        reason: "empty_key",
      })
    }
  })
  it('throws parser.parse_failed for mixed marked and unmarked lines', () => {
    const parser = new ListToKeyValueParser()
    expect(() => parser.parse("- Name: Greg\nRole: Dev")).toThrow(LlmExeError)
  })
  it('throws parser.parse_failed for empty input', () => {
    const parser = new ListToKeyValueParser()
    expect(() => parser.parse("")).toThrow(LlmExeError)
  })
  it('throws parser.parse_failed for invalid input type', () => {
    const parser = new ListToKeyValueParser()
    expect(() => parser.parse({} as any)).toThrow(LlmExeError)
  })
});
