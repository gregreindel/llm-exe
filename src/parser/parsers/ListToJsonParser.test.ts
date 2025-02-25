
import { BaseParser, ListToJsonParser } from "@/parser";
import { defineSchema } from "@/utils/modules/defineSchema";

/**
 * Tests the ListToJsonParser class
 */
describe("llm-exe:parser/ListToJsonParser", () => {
  it('creates class with expected properties', () => {
    const parser = new ListToJsonParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(ListToJsonParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("listToJson")
  })
  it('parses simple string correctly', () => {
    const parser = new ListToJsonParser()
    const input = `Name: Greg\nOccupation: developer`
    expect(parser.parse(input)).toEqual({ name: "Greg", occupation: "developer"})
  });
  it('parses simple string correctly', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "unknown" },
        occupation: { type: "string", default: "unemployed" },
      },
      required: ["occupation", "name"],
      additionalProperties: false,
    });
    const parser = new ListToJsonParser({ schema })
    const input = `Name: Greg\nOccupation: developer`
    expect(parser.parse(input)).toEqual({ name: "Greg", occupation: "developer"})
  });
  it('parses schema with error when set', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "unknown" },
        occupation: { type: "string", default: 0 },
      },
      required: ["occupation", "name"],
      additionalProperties: false,
    });
    const parser = new ListToJsonParser({ schema, validateSchema: true })
    const input = `Name: Greg\n`
    expect(() => parser.parse(input)).toThrowError("is not of a type(s) string")
  });
});

