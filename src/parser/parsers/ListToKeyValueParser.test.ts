import { BaseParser, ListToKeyValueParser } from "@/parser";

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
});

