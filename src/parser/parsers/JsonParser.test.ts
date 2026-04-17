
import { BaseParser, JsonParser } from "@/parser";
import { defineSchema } from "@/utils/modules/defineSchema";

/**
 * Tests the JsonParser class
 */
describe("llm-exe:parser/JsonParser", () => {
  it('creates class with expected properties', () => {
    const parser = new JsonParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(JsonParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("json")
  })
  it('parses simple string correctly', () => {
    const parser = new JsonParser()
    const input = JSON.stringify({ name: "Greg", occupation: "developer"})
    expect(parser.parse(input)).toEqual(JSON.parse(input))
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
    const parser = new JsonParser({ schema })
    const input = JSON.stringify({ name: "Greg", occupation: "developer"})
    expect(parser.parse(input)).toEqual(JSON.parse(input))
  });


  it('parses simple string correctly', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "unknown" },
        confused: { type: "boolean", default: false },
      },
      required: ["confused", "name"],
      additionalProperties: false,
    });
    const parser = new JsonParser({ schema })
    const input = JSON.stringify({ name: "Greg", confused: true})
    expect(parser.parse(input)).toEqual(JSON.parse(input))
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
    const parser = new JsonParser({ schema, validateSchema: true })
    const input = JSON.stringify({ name: "Greg", occupation: 0})
    expect(() => parser.parse(input)).toThrowError("is not of a type(s) string")
  });

  it('parses JSON with extra whitespace and newlines', () => {
    const parser = new JsonParser()
    const input = `  \n  { "name": "Greg" }  \n  `
    expect(parser.parse(input)).toEqual({ name: "Greg" })
  });

  it('parses JSON arrays', () => {
    const parser = new JsonParser()
    const input = JSON.stringify(["a", "b", "c"])
    expect(parser.parse(input)).toEqual(["a", "b", "c"])
  });

  it('parses nested JSON objects', () => {
    const parser = new JsonParser()
    const input = JSON.stringify({ user: { name: "Greg", tags: ["dev", "test"] } })
    expect(parser.parse(input)).toEqual({ user: { name: "Greg", tags: ["dev", "test"] } })
  });

  it('handles JSON wrapped in markdown code block', () => {
    const parser = new JsonParser()
    const input = '```json\n{"name": "Greg"}\n```'
    expect(parser.parse(input)).toEqual({ name: "Greg" })
  });

  it('enforces schema defaults for missing properties', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "unknown" },
        occupation: { type: "string", default: "unemployed" },
      },
      required: ["occupation", "name"],
      additionalProperties: false,
    });
    const parser = new JsonParser({ schema })
    const input = JSON.stringify({ name: "Greg" })
    expect(parser.parse(input)).toEqual({ name: "Greg", occupation: "unemployed" })
  });

  it('strips additional properties when schema has additionalProperties false', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string" },
      },
      additionalProperties: false,
    });
    const parser = new JsonParser({ schema })
    const input = JSON.stringify({ name: "Greg", extra: "field" })
    expect(parser.parse(input)).toEqual({ name: "Greg" })
  });

  it('parses without validation when validateSchema is not set', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string" },
      },
      additionalProperties: false,
    });
    const parser = new JsonParser({ schema })
    const input = JSON.stringify({ name: 123 })
    expect(() => parser.parse(input)).not.toThrow()
  });

  it('handles empty object', () => {
    const parser = new JsonParser()
    expect(parser.parse("{}")).toEqual({})
  });

  it('handles empty array', () => {
    const parser = new JsonParser()
    expect(parser.parse("[]")).toEqual([])
  });

  it('parses boolean schema property correctly', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        active: { type: "boolean", default: false },
      },
      required: ["active"],
      additionalProperties: false,
    });
    const parser = new JsonParser({ schema, validateSchema: true })
    const input = JSON.stringify({ active: true })
    expect(parser.parse(input)).toEqual({ active: true })
  });

});

