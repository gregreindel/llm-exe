

import { enforceParserSchema, validateParserSchema } from "@/parser/_utils";
import { defineSchema } from "@/utils/modules/defineSchema";

/**
 * Tests the enforceParserSchema 
 */
describe("llm-exe:parser/_utils/enforceParserSchema", () => {
  it('parses simple string correctly', () => {
    const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string", default: "unknown" },
          age: { type: "integer", default: 0 },
        },
        required: ["age", "name"],
        additionalProperties: false,
      });

    const obj = { name: "greg", age: "82"}
    const enforce = enforceParserSchema(schema, obj);

    expect(enforce).toEqual({ name: "greg", age: 82})
  });
  it('returns with invalid input', () => {
    const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string", default: "unknown" },
          age: { type: "integer", default: 0 },
        },
        required: ["age", "name"],
        additionalProperties: false,
      });

    const obj = `{ name: "greg", age: "82"}`
    const enforce = enforceParserSchema(schema, obj  as any);
    expect(enforce).toEqual(obj)
  });
  it('returns with invalid schema', () => {
    const obj = { name: "greg", age: "82"}
    const enforce = enforceParserSchema(null as any, obj);
    expect(enforce).toEqual(obj)
  });
});

/**
 * Tests the validateParserSchema 
 */
describe("llm-exe:parser/_utils/validateParserSchema", () => {
    it('null if no errors', () => {
      const schema = defineSchema({
          type: "object",
          properties: {
            name: { type: "string", default: "unknown" },
            age: { type: "integer", default: 0 },
          },
          required: ["age", "name"],
          additionalProperties: false,
        });
  
      const obj = { name: "greg", age: 82}
      const validate = validateParserSchema(schema, obj);
      expect(validate).toEqual(null)
    });
    it('error if invalid', () => {
      const schema = defineSchema({
          type: "object",
          properties: {
            name: { type: "string", default: "unknown" },
            age: { type: "integer", default: 0 },
          },
          required: ["age", "name"],
          additionalProperties: false,
        });
  
        const obj = { name: "greg", age: "82"}
      const enforce = validateParserSchema(schema, obj);
      expect(typeof enforce).toEqual("object")
      expect(Array.isArray(enforce)).toEqual(true)
    });
    it('returns with invalid input', () => {
        const schema = defineSchema({
            type: "object",
            properties: {
              name: { type: "string", default: "unknown" },
              age: { type: "integer", default: 0 },
            },
            required: ["age", "name"],
            additionalProperties: false,
          });
    
        const obj = `{ name: "greg", age: "82"}`
        const enforce = validateParserSchema(schema, obj as any);
        expect(enforce).toEqual(null)
      });
    it('returns with invalid schema', () => {
      const obj = { name: "greg", age: "82"}
      const enforce = validateParserSchema(null as any, obj);
      expect(enforce).toEqual(null)
    });
  });

/**
 * Edge case coverage for both utilities
 */
describe("llm-exe:parser/_utils edge cases", () => {
  const schema = defineSchema({
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "integer" },
    },
    required: ["name", "age"],
    additionalProperties: false,
  });

  it("enforceParserSchema returns parsed when parsed is null", () => {
    const result = enforceParserSchema(schema, null as any);
    expect(result).toBeNull();
  });

  it("enforceParserSchema returns parsed when parsed is undefined", () => {
    const result = enforceParserSchema(schema, undefined as any);
    expect(result).toBeUndefined();
  });

  it("enforceParserSchema returns parsed when parsed is a number (non-object)", () => {
    const result = enforceParserSchema(schema, 42 as any);
    expect(result).toBe(42);
  });

  it("enforceParserSchema returns parsed when parsed is a boolean", () => {
    const result = enforceParserSchema(schema, true as any);
    expect(result).toBe(true);
  });

  it("enforceParserSchema returns parsed unchanged when schema is undefined", () => {
    const obj = { name: "a", age: 1 };
    const result = enforceParserSchema(undefined, obj);
    expect(result).toEqual(obj);
  });

  it("validateParserSchema returns null when parsed is null", () => {
    expect(validateParserSchema(schema, null as any)).toBeNull();
  });

  it("validateParserSchema returns null when parsed is undefined", () => {
    expect(validateParserSchema(schema, undefined as any)).toBeNull();
  });

  it("validateParserSchema returns null when parsed is a number", () => {
    expect(validateParserSchema(schema, 5 as any)).toBeNull();
  });

  it("validateParserSchema returns null when schema is undefined", () => {
    expect(
      validateParserSchema(undefined as any, { name: "a", age: 1 })
    ).toBeNull();
  });
});
  