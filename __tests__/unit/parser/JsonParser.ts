
import { BaseParser, JsonParser } from "@/parser";
import { defineSchema } from "@/utils";

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



});

