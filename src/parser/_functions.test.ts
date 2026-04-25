import { createParser, createCustomParser } from "./_functions";
import { StringParser } from "./parsers/StringParser";
import { BooleanParser } from "./parsers/BooleanParser";
import { NumberParser } from "./parsers/NumberParser";
import { JsonParser } from "./parsers/JsonParser";
import { ListToJsonParser } from "./parsers/ListToJsonParser";
import { ListToKeyValueParser } from "./parsers/ListToKeyValueParser";
import { ListToArrayParser } from "./parsers/ListToArrayParser";
import { ReplaceStringTemplateParser } from "./parsers/ReplaceStringTemplateParser";
import { MarkdownCodeBlockParser } from "./parsers/MarkdownCodeBlock";
import { MarkdownCodeBlocksParser } from "./parsers/MarkdownCodeBlocks";
import { StringExtractParser } from "./parsers/StringExtractParser";
import { CustomParser } from "./parsers/CustomParser";

describe("createParser", () => {
  it("creates a StringParser for type 'string'", () => {
    const parser = createParser("string");
    expect(parser).toBeInstanceOf(StringParser);
  });

  it("creates a BooleanParser for type 'boolean'", () => {
    const parser = createParser("boolean");
    expect(parser).toBeInstanceOf(BooleanParser);
  });

  it("creates a NumberParser for type 'number'", () => {
    const parser = createParser("number");
    expect(parser).toBeInstanceOf(NumberParser);
  });

  it("creates a JsonParser for type 'json'", () => {
    const parser = createParser("json");
    expect(parser).toBeInstanceOf(JsonParser);
  });

  it("creates a JsonParser with schema options", () => {
    const schema = {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    } as const;
    const parser = createParser("json", { schema });
    expect(parser).toBeInstanceOf(JsonParser);
  });

  it("creates a ListToJsonParser for type 'listToJson'", () => {
    const parser = createParser("listToJson");
    expect(parser).toBeInstanceOf(ListToJsonParser);
  });

  it("creates a ListToArrayParser for type 'listToArray'", () => {
    const parser = createParser("listToArray");
    expect(parser).toBeInstanceOf(ListToArrayParser);
  });

  it("creates a ListToKeyValueParser for type 'listToKeyValue'", () => {
    const parser = createParser("listToKeyValue");
    expect(parser).toBeInstanceOf(ListToKeyValueParser);
  });

  it("creates a ReplaceStringTemplateParser for type 'replaceStringTemplate'", () => {
    const parser = createParser("replaceStringTemplate");
    expect(parser).toBeInstanceOf(ReplaceStringTemplateParser);
  });

  it("creates a MarkdownCodeBlockParser for type 'markdownCodeBlock'", () => {
    const parser = createParser("markdownCodeBlock");
    expect(parser).toBeInstanceOf(MarkdownCodeBlockParser);
  });

  it("creates a MarkdownCodeBlocksParser for type 'markdownCodeBlocks'", () => {
    const parser = createParser("markdownCodeBlocks");
    expect(parser).toBeInstanceOf(MarkdownCodeBlocksParser);
  });

  it("creates a StringExtractParser for type 'stringExtract'", () => {
    const parser = createParser("stringExtract", {
      enum: ["yes", "no"],
    });
    expect(parser).toBeInstanceOf(StringExtractParser);
  });

  it("throws for an invalid parser type", () => {
    expect(() => createParser("invalid" as any)).toThrow(
      /Invalid parser type: "invalid"/
    );
  });

  it("error message includes all valid types", () => {
    try {
      createParser("bad" as any);
    } catch (e: any) {
      expect(e.message).toContain("json");
      expect(e.message).toContain("string");
      expect(e.message).toContain("boolean");
      expect(e.message).toContain("number");
      expect(e.message).toContain("stringExtract");
      expect(e.message).toContain("listToArray");
      expect(e.message).toContain("listToJson");
      expect(e.message).toContain("listToKeyValue");
      expect(e.message).toContain("replaceStringTemplate");
      expect(e.message).toContain("markdownCodeBlock");
      expect(e.message).toContain("markdownCodeBlocks");
    }
  });
});

describe("createCustomParser", () => {
  it("creates a CustomParser with the given name and function", () => {
    const parser = createCustomParser("my-parser", (text) => text.toUpperCase());
    expect(parser).toBeInstanceOf(CustomParser);
    expect(parser.name).toBe("my-parser");
  });

  it("parser function is invoked correctly", () => {
    const parser = createCustomParser("reverse", (text) =>
      text.split("").reverse().join("")
    );
    const result = parser.parse("hello", {} as any);
    expect(result).toBe("olleh");
  });

  it("parser receives context as second argument", () => {
    const parserFn = jest.fn((text: string, context: any) => ({
      text,
      hasContext: !!context,
    }));
    const parser = createCustomParser("ctx-parser", parserFn);
    const ctx = { prompt: {}, result: {} } as any;
    parser.parse("input", ctx);
    expect(parserFn).toHaveBeenCalledWith("input", ctx);
  });

  it("can return complex types", () => {
    const parser = createCustomParser("json-extract", (text) => {
      const parsed = JSON.parse(text);
      return { items: parsed.items as string[], count: parsed.items.length as number };
    });
    const result = parser.parse('{"items": ["a", "b", "c"]}', {} as any);
    expect(result).toEqual({ items: ["a", "b", "c"], count: 3 });
  });

  it("propagates errors thrown by the parser function", () => {
    const parser = createCustomParser("thrower", () => {
      throw new Error("parse failed");
    });
    expect(() => parser.parse("input", {} as any)).toThrow("parse failed");
  });

  it("can return null from parser function", () => {
    const parser = createCustomParser("null-parser", () => null);
    const result = parser.parse("anything", {} as any);
    expect(result).toBeNull();
  });

  it("can return undefined from parser function", () => {
    const parser = createCustomParser("undef-parser", () => undefined);
    const result = parser.parse("anything", {} as any);
    expect(result).toBeUndefined();
  });

  it("can return an empty string from parser function", () => {
    const parser = createCustomParser("empty", () => "");
    const result = parser.parse("anything", {} as any);
    expect(result).toBe("");
  });

  it("can return an array from parser function", () => {
    const parser = createCustomParser("array-parser", (text) =>
      text.split(",")
    );
    const result = parser.parse("a,b,c", {} as any);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("handles empty string input to parser function", () => {
    const parser = createCustomParser("echo", (text) => text);
    const result = parser.parse("", {} as any);
    expect(result).toBe("");
  });

  it("works with an empty string name", () => {
    const parser = createCustomParser("", (text) => text);
    expect(parser.name).toBe("");
  });
});
