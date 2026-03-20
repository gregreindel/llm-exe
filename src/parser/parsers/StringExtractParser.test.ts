import { BaseParser } from "@/parser";
import { StringExtractParser } from "@/parser/parsers/StringExtractParser";
import { LlmExeError } from "@/utils/modules/errors";

/**
 * Tests the StringExtractParser class
 */
describe("llm-exe:parser/StringExtractParser", () => {
  it('creates class with expected properties', () => {
    const parser = new StringExtractParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(StringExtractParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("stringExtract")
  })
  it('parses simple string correctly', () => {
    const parser = new StringExtractParser({enum: ["Hello"]})
    expect(parser.parse("Hello!!")).toEqual("Hello")
  })
  it('throws error when no enum value matches', () => {
    const parser = new StringExtractParser({enum: ["Hello"]})
    expect(() => parser.parse("Yo!!")).toThrow("No matching value found. Expected one of: Hello")
  })
  it('parses simple string correctly with options.ignoreCase', () => {
    const parser = new StringExtractParser({enum: ["Hello"], ignoreCase: true})
    expect(parser.parse("hello")).toEqual("Hello")
    expect(parser.parse("hElLo")).toEqual("Hello")
  })
  it('parses array to string', () => {
    const parser = new StringExtractParser({enum: ["Hello"]});
    const badValue = ["Hello"] as unknown as string;
    expect(() => parser.parse(badValue)).toThrow("Invalid input. Expected string. Received object.")
  })
  it('parses object to string', () => {
    const parser = new StringExtractParser({enum: ["Hello"]});
    const badValue = {hello: "world"} as unknown as string;
    expect(() => parser.parse(badValue)).toThrow("Invalid input. Expected string. Received object.")
  });
  it('throws LlmExeError with parser code when no match found', () => {
    const parser = new StringExtractParser({enum: ["yes", "no"]});
    expect(() => parser.parse("The answer is maybe")).toThrow();
    try {
      parser.parse("The answer is maybe");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError<"parser">).code).toEqual("parser");
      expect((e as LlmExeError<"parser">).context).toEqual({
        parser: "stringExtract",
        output: "The answer is maybe",
        error: "No matching value found. Expected one of: yes, no",
      });
    }
  });
  it('throws error with multiple enum values listed', () => {
    const parser = new StringExtractParser({enum: ["red", "green", "blue"]});
    expect(() => parser.parse("yellow")).toThrow("No matching value found. Expected one of: red, green, blue")
  });
  it('throws error when no enum values configured', () => {
    const parser = new StringExtractParser();
    expect(() => parser.parse("anything")).toThrow("No matching value found. Expected one of: ")
  });
});

