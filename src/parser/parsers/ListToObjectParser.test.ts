import { BaseParser, BaseParserWithJson, ListToObjectParser } from "@/parser";
import { LlmExeError } from "@/errors";
import { defineSchema } from "@/utils/modules/defineSchema";

describe("llm-exe:parser/ListToObjectParser", () => {
  it("creates class with expected properties", () => {
    const parser = new ListToObjectParser();
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toBeInstanceOf(BaseParserWithJson);
    expect(parser).toBeInstanceOf(ListToObjectParser);
    expect(parser.name).toEqual("listToObject");
  });

  it("parses lines into a Record<string,string>", () => {
    const parser = new ListToObjectParser();
    expect(parser.parse("name: Greg\nrole: Dev")).toEqual({
      name: "Greg",
      role: "Dev",
    });
  });

  it("preserves keys as-written by default", () => {
    const parser = new ListToObjectParser();
    expect(parser.parse("First Name: Greg")).toEqual({ "First Name": "Greg" });
  });

  it("camelCases keys when keyTransform is camelCase", () => {
    const parser = new ListToObjectParser({ keyTransform: "camelCase" });
    expect(parser.parse("First Name: Greg")).toEqual({ firstName: "Greg" });
  });

  it("throws on duplicate keys", () => {
    const parser = new ListToObjectParser();
    try {
      parser.parse("name: Greg\nname: Bob");
      fail("Expected an error to be thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError).context).toMatchObject({
        operation: "ListToObjectParser.parse",
        parser: "listToObject",
        reason: "duplicate_key",
      });
    }
  });

  it("throws parser.parse_failed for malformed lines", () => {
    const parser = new ListToObjectParser();
    expect(() => parser.parse("Name Greg")).toThrow(LlmExeError);
  });

  it("throws parser.parse_failed for empty keys", () => {
    const parser = new ListToObjectParser();
    expect(() => parser.parse(": Greg")).toThrow(LlmExeError);
  });

  it("throws for invalid input type", () => {
    const parser = new ListToObjectParser();
    expect(() => {
      // @ts-expect-error runtime contract: parser rejects object input.
      parser.parse({});
    }).toThrow(LlmExeError);
  });

  describe("schema support", () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name", "age"],
      additionalProperties: false,
    });

    it("coerces values with a provided schema", () => {
      const parser = new ListToObjectParser({ schema });
      expect(parser.parse("name: Greg\nage: 42")).toEqual({
        name: "Greg",
        age: 42,
      });
    });

    it("validates and throws when validateSchema is enabled", () => {
      const parser = new ListToObjectParser({ schema, validateSchema: true });
      try {
        parser.parse("name: Greg");
        fail("Expected an error to be thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(LlmExeError);
        expect((e as LlmExeError).context).toMatchObject({
          operation: "ListToObjectParser.parse",
          parser: "listToObject",
        });
      }
    });
  });
});
