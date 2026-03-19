
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
  it('preserves colons in values (URLs)', () => {
    const parser = new ListToJsonParser()
    const input = `URL: https://example.com\nName: Greg`
    expect(parser.parse(input)).toEqual({ url: "https://example.com", name: "Greg"})
  });
  it('preserves colons in values (timestamps)', () => {
    const parser = new ListToJsonParser()
    const input = `Time: 10:30:00\nEvent: meeting`
    expect(parser.parse(input)).toEqual({ time: "10:30:00", event: "meeting"})
  });
  it('camelCases keys by default', () => {
    const parser = new ListToJsonParser()
    const input = `First Name: John\nLast Name: Doe`
    expect(parser.parse(input)).toEqual({ firstName: "John", lastName: "Doe"})
  });
  it('preserves keys when keyTransform is "preserve"', () => {
    const parser = new ListToJsonParser({ keyTransform: "preserve" })
    const input = `First Name: John\nLast Name: Doe`
    expect(parser.parse(input)).toEqual({ "First Name": "John", "Last Name": "Doe"})
  });
  it('camelCases keys when keyTransform is "camelCase"', () => {
    const parser = new ListToJsonParser({ keyTransform: "camelCase" })
    const input = `First Name: John\nLast Name: Doe`
    expect(parser.parse(input)).toEqual({ firstName: "John", lastName: "Doe"})
  });
  it('preserves keys with colons in values', () => {
    const parser = new ListToJsonParser({ keyTransform: "preserve" })
    const input = `Website URL: https://example.com\nFull Name: Greg`
    expect(parser.parse(input)).toEqual({ "Website URL": "https://example.com", "Full Name": "Greg"})
  });
  it('preserves keys with schema', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        "First Name": { type: "string", default: "unknown" },
        "Last Name": { type: "string", default: "unknown" },
      },
      required: ["First Name", "Last Name"],
      additionalProperties: false,
    });
    const parser = new ListToJsonParser({ schema, keyTransform: "preserve" })
    const input = `First Name: John\nLast Name: Doe`
    expect(parser.parse(input)).toEqual({ "First Name": "John", "Last Name": "Doe"})
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

