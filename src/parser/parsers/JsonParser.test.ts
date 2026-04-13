import { BaseParser, JsonParser } from "@/parser";
import { defineSchema } from "@/utils/modules/defineSchema";
import { LlmExeError } from "@/utils/modules/errors";

/**
 * Tests the JsonParser class
 */
describe("llm-exe:parser/JsonParser", () => {
  it("creates class with expected properties", () => {
    const parser = new JsonParser();
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toBeInstanceOf(JsonParser);
    expect(parser).toHaveProperty("name");
    expect(parser.name).toEqual("json");
  });

  it("parses simple string correctly", () => {
    const parser = new JsonParser();
    const input = JSON.stringify({ name: "Greg", occupation: "developer" });
    expect(parser.parse(input)).toEqual(JSON.parse(input));
  });

  it("parses simple string correctly with schema", () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "unknown" },
        occupation: { type: "string", default: "unemployed" },
      },
      required: ["occupation", "name"],
      additionalProperties: false,
    });
    const parser = new JsonParser({ schema });
    const input = JSON.stringify({ name: "Greg", occupation: "developer" });
    expect(parser.parse(input)).toEqual(JSON.parse(input));
  });

  it("parses boolean in schema correctly", () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "unknown" },
        confused: { type: "boolean", default: false },
      },
      required: ["confused", "name"],
      additionalProperties: false,
    });
    const parser = new JsonParser({ schema });
    const input = JSON.stringify({ name: "Greg", confused: true });
    expect(parser.parse(input)).toEqual(JSON.parse(input));
  });

  it("parses schema with error when validateSchema set", () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "unknown" },
        occupation: { type: "string", default: 0 },
      },
      required: ["occupation", "name"],
      additionalProperties: false,
    });
    const parser = new JsonParser({ schema, validateSchema: true });
    const input = JSON.stringify({ name: "Greg", occupation: 0 });
    expect(() => parser.parse(input)).toThrowError(
      "is not of a type(s) string"
    );
  });

  describe("markdown handling", () => {
    it("strips ```json fences before parsing", () => {
      const parser = new JsonParser();
      const input = '```json\n{"key":"value"}\n```';
      expect(parser.parse(input)).toEqual({ key: "value" });
    });

    it("returns parsed object for plain JSON with no fences", () => {
      const parser = new JsonParser();
      expect(parser.parse('{"a":1,"b":2}')).toEqual({ a: 1, b: 2 });
    });
  });

  describe("malformed / empty input", () => {
    it("returns empty object for empty string", () => {
      const parser = new JsonParser();
      expect(parser.parse("")).toEqual({});
    });

    it("returns empty object for invalid JSON string", () => {
      const parser = new JsonParser();
      expect(parser.parse("not real json")).toEqual({});
    });

    it("returns empty object for JSON primitive (number)", () => {
      const parser = new JsonParser();
      expect(parser.parse("42")).toEqual({});
    });

    it("returns empty object for JSON primitive (string)", () => {
      const parser = new JsonParser();
      expect(parser.parse('"just a string"')).toEqual({});
    });

    it("returns parsed array for JSON array", () => {
      const parser = new JsonParser();
      expect(parser.parse("[1,2,3]")).toEqual([1, 2, 3]);
    });
  });

  describe("schema enforcement (no validateSchema)", () => {
    it("filters out additional properties not in schema", () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
        additionalProperties: false,
      });
      const parser = new JsonParser({ schema });
      const input = JSON.stringify({ name: "Greg", extra: "should be removed" });
      const result = parser.parse(input) as any;
      expect(result).toHaveProperty("name", "Greg");
      expect(result).not.toHaveProperty("extra");
    });

    it("does not throw when schema doesn't match but validateSchema is false", () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      });
      const parser = new JsonParser({ schema });
      // Wrong shape but no validation — should not throw
      const input = JSON.stringify({ name: 123 });
      expect(() => parser.parse(input)).not.toThrow();
    });

    it("returns parsed value unchanged when input is not an object", () => {
      const schema = defineSchema({
        type: "object",
        properties: { a: { type: "number" } },
      });
      const parser = new JsonParser({ schema });
      // maybeParseJSON returns {} for non-object JSON; filterObjectOnSchema
      // will get an empty object and return it.
      expect(parser.parse("42")).toEqual({});
    });
  });

  describe("schema validation (validateSchema: true)", () => {
    it("throws LlmExeError with parser code and context on validation failure", () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          age: { type: "number" },
        },
        required: ["age"],
      });
      const parser = new JsonParser({ schema, validateSchema: true });
      try {
        parser.parse(JSON.stringify({ age: "not a number" }));
        fail("Expected an error to be thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(LlmExeError);
        expect((e as LlmExeError).code).toEqual("parser");
        expect((e as LlmExeError).context).toHaveProperty("parser", "json");
        expect((e as LlmExeError).context).toHaveProperty("output");
        expect((e as LlmExeError).context).toHaveProperty("error");
      }
    });

    it("throws when required field is missing", () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name", "age"],
      });
      const parser = new JsonParser({ schema, validateSchema: true });
      expect(() =>
        parser.parse(JSON.stringify({ name: "Greg" }))
      ).toThrowError(/age/);
    });

    it("does not throw when input matches schema", () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name", "age"],
      });
      const parser = new JsonParser({ schema, validateSchema: true });
      const result = parser.parse(
        JSON.stringify({ name: "Greg", age: 30 })
      );
      expect(result).toEqual({ name: "Greg", age: 30 });
    });

    it("handles nested schema correctly", () => {
      const schema = defineSchema({
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
            },
            required: ["name", "email"],
          },
        },
        required: ["user"],
      });
      const parser = new JsonParser({ schema, validateSchema: true });
      const result = parser.parse(
        JSON.stringify({ user: { name: "Greg", email: "g@example.com" } })
      );
      expect(result).toEqual({
        user: { name: "Greg", email: "g@example.com" },
      });
    });
  });
});
