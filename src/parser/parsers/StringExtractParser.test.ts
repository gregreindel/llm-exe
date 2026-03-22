import { BaseParser,  } from "@/parser";
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
  it('throws LlmExeError when no enum value matches', () => {
    const parser = new StringExtractParser({enum: ["Hello"]})
    expect(() => parser.parse("Yo!!")).toThrow(LlmExeError)
    expect(() => parser.parse("Yo!!")).toThrow("No matching enum value found in input.")
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
  it('throws LlmExeError with parser error code when no match', () => {
    const parser = new StringExtractParser({enum: ["yes", "no"]})
    try {
      parser.parse("The answer is maybe");
      fail("Expected an error to be thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError).code).toEqual("parser");
      expect((e as LlmExeError).context).toEqual({
        parser: "stringExtract",
        output: "The answer is maybe",
        error: "No matching enum value found in input. Expected one of: yes, no",
      });
    }
  });
  it('throws when no enum values are provided and input is given', () => {
    const parser = new StringExtractParser()
    expect(() => parser.parse("anything")).toThrow(LlmExeError)
  });
});

