

import {
  applyParserSchemaDefaultsAndFilter,
  coerceParserSchemaValues,
  enforceParserSchema,
  validateParserSchema,
} from "@/parser/_utils";
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

describe("llm-exe:parser/_utils/coerceParserSchemaValues", () => {
  it("coerces number and boolean strings using schema types", () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        age: { type: "integer" },
        score: { type: "number" },
        active: { type: "boolean" },
      },
      additionalProperties: false,
    });

    expect(
      coerceParserSchemaValues(schema, {
        age: "82",
        score: "9.5",
        active: "false",
      })
    ).toEqual({ age: 82, score: 9.5, active: false });
  });

  it("leaves invalid coercion candidates for schema validation", () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        active: { type: "boolean" },
      },
      additionalProperties: false,
    });

    expect(coerceParserSchemaValues(schema, { active: "maybe" })).toEqual({
      active: "maybe",
    });
  });
});

describe("llm-exe:parser/_utils/applyParserSchemaDefaultsAndFilter", () => {
  it("applies defaults and filters unknown properties without coercing values", () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "unknown" },
        active: { type: "boolean" },
      },
      additionalProperties: false,
    });

    expect(
      applyParserSchemaDefaultsAndFilter(schema, {
        active: "false",
        extra: "removed",
      })
    ).toEqual({ name: "unknown", active: "false" });
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
  
