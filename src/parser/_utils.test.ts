

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
  it('returns null when parsed is null', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string" },
      },
    });
    const enforce = enforceParserSchema(schema, null as any);
    expect(enforce).toBeNull();
  });
  it('returns undefined when parsed is undefined', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string" },
      },
    });
    const enforce = enforceParserSchema(schema, undefined as any);
    expect(enforce).toBeUndefined();
  });
  it('returns parsed when schema is undefined', () => {
    const obj = { name: "greg" };
    const enforce = enforceParserSchema(undefined as any, obj);
    expect(enforce).toEqual(obj);
  });
  it('filters extra properties when additionalProperties is false', () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string" },
      },
      additionalProperties: false,
    });
    const obj = { name: "greg", extra: "should be removed" };
    const enforce = enforceParserSchema(schema, obj);
    expect(enforce).toEqual({ name: "greg" });
    expect(enforce).not.toHaveProperty("extra");
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
    it('returns null when parsed is null', () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string" },
        },
      });
      const result = validateParserSchema(schema, null as any);
      expect(result).toBeNull();
    });
    it('returns null when parsed is undefined', () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string" },
        },
      });
      const result = validateParserSchema(schema, undefined as any);
      expect(result).toBeNull();
    });
    it('returns errors for missing required properties', () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["name", "age"],
      });
      const result = validateParserSchema(schema, { name: "greg" } as any);
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });
    it('returns null for valid object with no errors', () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string" },
          active: { type: "boolean" },
        },
        required: ["name"],
      });
      const result = validateParserSchema(schema, { name: "test", active: true });
      expect(result).toBeNull();
    });
  });
