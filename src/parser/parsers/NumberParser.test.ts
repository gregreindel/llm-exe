import { BaseParser, NumberParser } from "@/parser";
import { LlmExeError } from "@/utils/modules/errors";

/**
 * Tests the NumberParser class
 */
describe("llm-exe:parser/NumberParser", () => {
  it('creates class with expected properties', () => {
    const parser = new NumberParser()
    expect(parser).toBeInstanceOf(BaseParser)
    expect(parser).toBeInstanceOf(NumberParser)
    expect(parser).toHaveProperty("name")
    expect(parser.name).toEqual("number")
  })
  it('parses simple string correctly', () => {
    const parser = new NumberParser()
    expect(parser.parse("1")).toEqual(1)
  });
  it('parses multi-digit numbers', () => {
    const parser = new NumberParser()
    expect(parser.parse("42")).toEqual(42)
    expect(parser.parse("100")).toEqual(100)
    expect(parser.parse("1234567")).toEqual(1234567)
  });
  it('parses decimal numbers', () => {
    const parser = new NumberParser()
    expect(parser.parse("3.14")).toEqual(3.14)
    expect(parser.parse("0.5")).toEqual(0.5)
  });
  it('parses comma numbers', () => {
    const parser = new NumberParser()
    expect(parser.parse("1,000")).toEqual(1000)
    expect(parser.parse("1,234,567")).toEqual(1234567)
  });
  it('parses scientific notation', () => {
    const parser = new NumberParser()
    expect(parser.parse("1e3")).toEqual(1000)
    expect(parser.parse("-2.5e2")).toEqual(-250)
  });
  it('parses leading decimals', () => {
    const parser = new NumberParser()
    expect(parser.parse(".5")).toEqual(0.5)
    expect(parser.parse("-.25")).toEqual(-0.25)
  });
  it('parses negative numbers', () => {
    const parser = new NumberParser()
    expect(parser.parse("-7")).toEqual(-7)
    expect(parser.parse("-3.14")).toEqual(-3.14)
    expect(parser.parse("-1")).toEqual(-1)
  });
  it('parses negative one from surrounding text', () => {
    const parser = new NumberParser()
    expect(parser.parse("the answer is -1")).toEqual(-1)
  });
  it('extracts number from surrounding text', () => {
    const parser = new NumberParser()
    expect(parser.parse("The answer is 42.")).toEqual(42)
    expect(parser.parse("Score: 99 points")).toEqual(99)
  });
  it('throws LlmExeError if no number found', () => {
    const parser = new NumberParser()
    expect(() => parser.parse("No Number")).toThrow(LlmExeError)
  });
  it('throws LlmExeError with parser error code when no number found', () => {
    const parser = new NumberParser()
    try {
      parser.parse("not a number");
      fail("Expected an error to be thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError).code).toEqual("parser.parse_failed");
      expect((e as LlmExeError).context).toEqual({
        operation: "NumberParser.parse",
        parser: "number",
        reason: "no_numeric_value",
        expected: "number",
        match: "extract",
        inputLength: 12,
      });
    }
  });
  it('throws parser.parse_failed for empty input', () => {
    const parser = new NumberParser()
    try {
      parser.parse("");
      fail("Expected an error to be thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError).context).toEqual({
        operation: "NumberParser.parse",
        parser: "number",
        reason: "empty_input",
        expected: "number",
        inputLength: 0,
      });
    }
  });
  it('throws parser.parse_failed for whitespace-only input', () => {
    const parser = new NumberParser()
    expect(() => parser.parse("   ")).toThrow(LlmExeError)
  });
  it('throws parser.parse_failed for multiple numbers', () => {
    const parser = new NumberParser()
    try {
      parser.parse("from 1 to 10");
      fail("Expected an error to be thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError).context).toEqual({
        operation: "NumberParser.parse",
        parser: "number",
        reason: "ambiguous_number",
        expected: "one numeric value",
        match: "extract",
        inputLength: 12,
        matchCount: 2,
      });
    }
  });
  it('throws parser.parse_failed for runtime number input', () => {
    const parser = new NumberParser()
    try {
      parser.parse(42 as any);
      fail("Expected an error to be thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError).context).toEqual({
        operation: "NumberParser.parse",
        parser: "number",
        reason: "invalid_input_type",
        expected: "string",
        received: "number",
      });
    }
  });
  it('throws parser.parse_failed for null input', () => {
    const parser = new NumberParser()
    expect(() => parser.parse(null as any)).toThrow(LlmExeError)
  });

  describe("match: whole", () => {
    it("accepts a bare integer", () => {
      const parser = new NumberParser({ match: "whole" })
      expect(parser.parse("42")).toEqual(42)
    })
    it("accepts a bare decimal", () => {
      const parser = new NumberParser({ match: "whole" })
      expect(parser.parse("3.14")).toEqual(3.14)
    })
    it("accepts a comma-grouped number", () => {
      const parser = new NumberParser({ match: "whole" })
      expect(parser.parse("1,000")).toEqual(1000)
    })
    it("accepts a value after trim", () => {
      const parser = new NumberParser({ match: "whole" })
      expect(parser.parse("  42  ")).toEqual(42)
    })
    it("rejects a number embedded in prose", () => {
      const parser = new NumberParser({ match: "whole" })
      try {
        parser.parse("The answer is 42.")
        fail("Expected an error to be thrown")
      } catch (e) {
        expect(e).toBeInstanceOf(LlmExeError)
        expect((e as LlmExeError).context).toMatchObject({
          reason: "no_numeric_value",
          match: "whole",
        })
      }
    })
    it("rejects multiple numbers", () => {
      const parser = new NumberParser({ match: "whole" })
      expect(() => parser.parse("1 2")).toThrow(LlmExeError)
    })
  })
});
