
import { BaseParser, ListToArrayParser } from "@/parser";

/**
 * Tests the ListToArrayParser class
 */
describe("llm-exe:parser/ListToArrayParser", () => {
  it('creates class with expected properties', () => {
    const parser = new ListToArrayParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(ListToArrayParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("listToArray")
  });
  it('removes hyphens', () => {
    const parser = new ListToArrayParser()
    const input = `- Greg\n- Developer`
    expect(parser.parse(input)).toEqual(["Greg", "Developer"])
  });
  it('parses simple string correctly', () => {
    const parser = new ListToArrayParser()
    const input = `Name: Greg\nOccupation: developer`
    expect(parser.parse(input)).toEqual(["Name: Greg", "Occupation: developer"])
  });
  it('trims extra spaces', () => {
    const parser = new ListToArrayParser()
    const input = `- Greg  \n- Developer  `
    expect(parser.parse(input)).toEqual(["Greg", "Developer"])
  });
  it('doesn\'t remove hyphens in the that aren\'t first', () => {
    const parser = new ListToArrayParser()
    const input = `- Greg\n- Occupation: software - developer`
    expect(parser.parse(input)).toEqual(["Greg", "Occupation: software - developer"])
  });
  it('removes numbered list prefixes', () => {
    const parser = new ListToArrayParser()
    const input = `1. First\n2. Second\n3. Third`
    expect(parser.parse(input)).toEqual(["First", "Second", "Third"])
  });
  it('removes asterisk list prefixes', () => {
    const parser = new ListToArrayParser()
    const input = `* First\n* Second\n* Third`
    expect(parser.parse(input)).toEqual(["First", "Second", "Third"])
  });
  it('handles mixed list formats', () => {
    const parser = new ListToArrayParser()
    const input = `- First\n* Second\n3. Third`
    expect(parser.parse(input)).toEqual(["First", "Second", "Third"])
  });
  it('preserves asterisks that are not list prefixes', () => {
    const parser = new ListToArrayParser()
    const input = `* bold text * here\n* another item`
    expect(parser.parse(input)).toEqual(["bold text * here", "another item"])
  });
  it('handles empty string input', () => {
    const parser = new ListToArrayParser()
    expect(parser.parse("")).toEqual([""])
  });
  it('handles single line without list prefix', () => {
    const parser = new ListToArrayParser()
    expect(parser.parse("just a sentence")).toEqual(["just a sentence"])
  });
  it('handles trailing newline', () => {
    const parser = new ListToArrayParser()
    const input = "- First\n- Second\n"
    expect(parser.parse(input)).toEqual(["First", "Second", ""])
  });
  it('replaces single quotes with unicode right quote', () => {
    const parser = new ListToArrayParser()
    const input = "- it's\n- don't"
    const result = parser.parse(input)
    expect(result[0]).toEqual("it\u2019s")
    expect(result[1]).toEqual("don\u2019t")
  });
  it('handles lines with only whitespace', () => {
    const parser = new ListToArrayParser()
    const input = "- First\n   \n- Third"
    const result = parser.parse(input)
    expect(result).toEqual(["First", "", "Third"])
  });
  it('handles double-digit numbered lists', () => {
    const parser = new ListToArrayParser()
    const input = "10. Tenth\n11. Eleventh"
    expect(parser.parse(input)).toEqual(["Tenth", "Eleventh"])
  });
  it('preserves colons and special characters in content', () => {
    const parser = new ListToArrayParser()
    const input = "- key: value\n- url: https://example.com"
    expect(parser.parse(input)).toEqual(["key: value", "url: https://example.com"])
  });
});

