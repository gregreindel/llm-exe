import { BaseParser } from "@/parser";
import { BaseParserOptions } from "@/types";
import { defineSchema, maybeParseJSON } from "@/utils";

/**
 * Tests the BaseParser class
 */
describe("llm-exe:parser/BaseParser", () => {
  class MockParser<T extends { name: string; age: number }> extends BaseParser {
    constructor(options?: BaseParserOptions) {
      super("mock-parser", options);
    }
  
    parse(text: string, _attributes?: T) {
      const parsed = maybeParseJSON(text);
      return this.enforceSchema(parsed);
    }
  }
  it('creates class with expected properties', () => {
    const parser = new MockParser()
    expect(parser).toBeInstanceOf(MockParser)
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("mock-parser")
  })
  it('parses simple string correctly', () => {
    const parser = new MockParser()
    expect(parser.parse(JSON.stringify({ age: 90, name: "Greg" }))).toEqual({ age: 90, name: "Greg" })
  })

  it('schema handles simple object', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "" },
        age: { type: "integer", default: 0 },
      },
      required: ["age", "name"],
      additionalProperties: false,
    });
    const parser = new MockParser({ schema })
    const input = { age: 90, name: "Greg" }
    expect(parser.parse(JSON.stringify(input))).toEqual(input)
  });


  it('schema throws error if invalid', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "" },
        age: { type: "integer", default: 0 },
      },
      required: ["age", "name"],
      additionalProperties: false,
    });
    const parser = new MockParser({ schema })
    const input = { age: ["90"], name: 3 }
    expect(() => parser.parse(JSON.stringify(input))).toThrowError("schema error")
  });

  it('schema handles simple array', () => {
    const schema = defineSchema({
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", default: "" },
          age: { type: "integer", default: 0 },
        },
        required: ["name", "age"],
        additionalProperties: false,
      },
    });
    const parser = new MockParser({ schema })
    const input = [{ age: 90, name: "Greg" }]
    expect(parser.parse(JSON.stringify(input))).toEqual(input)
  })
  it('schema handles simple object with defaults', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "none" },
        age: { type: "integer", default: 0 },
      },
      required: ["age", "name"],
      additionalProperties: false,
    });
    const parser = new MockParser({ schema })
    const input = {}
    expect(parser.parse(JSON.stringify(input))).toEqual({  age: 0, name: "none"  })
  });
  it('schema handles simple array with defaults', () => {
    const schema = defineSchema({
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", default: "none" },
          age: { type: "integer", default: 0 },
        },
        required: ["name", "age"],
        additionalProperties: false,
      },
    });
    const parser = new MockParser({ schema })
    const input = [{}]
    expect(parser.parse(JSON.stringify(input))).toEqual([{  age: 0, name: "none"  }])
  })
  it('schema handles simple array with defaults', () => {
    const schema = {}
    const parser = new MockParser({ schema })
    const input = {  age: '12', name: "Greg"  }
    expect(parser.parse(JSON.stringify(input))).toEqual(input)
  })
});

