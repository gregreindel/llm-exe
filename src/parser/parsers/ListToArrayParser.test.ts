
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
});

