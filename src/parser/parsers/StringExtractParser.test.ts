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
  it('returns first matching enum value when multiple could match', () => {
    const parser = new StringExtractParser({enum: ["yes", "yesss"]})
    expect(parser.parse("yesss please")).toEqual("yes")
  });
  it('matches enum value as substring of input text', () => {
    const parser = new StringExtractParser({enum: ["cat", "dog"]})
    expect(parser.parse("I like cats and dogs")).toEqual("cat")
  });
  it('treats enum values as regex patterns (special chars are not escaped)', () => {
    // Parentheses are regex metacharacters — "option(a)" becomes a regex
    // matching "optiona" (parens create a capture group), not literal "option(a)"
    const parser = new StringExtractParser({enum: ["option(a)"]})
    // Matches because regex /option(a)/ matches "optiona" in the text
    expect(parser.parse("optiona")).toEqual("option(a)")
  });
  it('handles pipe character in enum values (regex OR)', () => {
    // "|" in regex means alternation — this tests that enum values are used as-is
    const parser = new StringExtractParser({enum: ["a|b"]})
    // "a|b" as regex matches "a" or "b", so this will match even just "a"
    expect(parser.parse("a")).toEqual("a|b")
  });
  it('matches case-insensitively with ignoreCase across multiple values', () => {
    const parser = new StringExtractParser({enum: ["Apple", "Banana"], ignoreCase: true})
    expect(parser.parse("I want a BANANA")).toEqual("Banana")
  });
  it('error context includes all enum values', () => {
    const parser = new StringExtractParser({enum: ["red", "blue", "green"]})
    try {
      parser.parse("The color is yellow");
      fail("Expected an error to be thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError).context).toEqual({
        parser: "stringExtract",
        output: "The color is yellow",
        error: "No matching enum value found in input. Expected one of: red, blue, green",
      });
    }
  });
});

