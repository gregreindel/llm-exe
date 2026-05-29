import { BaseParser, ListToEntriesParser } from "@/parser";
import { LlmExeError } from "@/errors";

describe("llm-exe:parser/ListToEntriesParser", () => {
  it("creates class with expected properties", () => {
    const parser = new ListToEntriesParser();
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toBeInstanceOf(ListToEntriesParser);
    expect(parser.name).toEqual("listToEntries");
  });

  it("parses simple string into tuple array", () => {
    const parser = new ListToEntriesParser();
    expect(parser.parse("tool_name_1: Tool description 1\ntool_name_2: Tool description 2")).toEqual([
      ["tool_name_1", "Tool description 1"],
      ["tool_name_2", "Tool description 2"],
    ]);
  });

  it("preserves colons in values", () => {
    const parser = new ListToEntriesParser();
    expect(parser.parse("URL: https://example.com/a:b")).toEqual([
      ["URL", "https://example.com/a:b"],
    ]);
  });

  it("preserves duplicate keys and order", () => {
    const parser = new ListToEntriesParser();
    expect(parser.parse("Name: Greg\nName: Bob")).toEqual([
      ["Name", "Greg"],
      ["Name", "Bob"],
    ]);
  });

  it("accepts empty values", () => {
    const parser = new ListToEntriesParser();
    expect(parser.parse("Name:")).toEqual([["Name", ""]]);
  });

  it("strips shared list markers", () => {
    const parser = new ListToEntriesParser();
    expect(
      parser.parse("- Name: Greg\n* Role: Dev\n1. URL: https://example.com")
    ).toEqual([
      ["Name", "Greg"],
      ["Role", "Dev"],
      ["URL", "https://example.com"],
    ]);
  });

  it("throws parser.parse_failed for malformed lines", () => {
    const parser = new ListToEntriesParser();
    try {
      parser.parse("Name Greg");
      fail("Expected an error to be thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError).context).toMatchObject({
        operation: "ListToEntriesParser.parse",
        parser: "listToEntries",
        reason: "malformed_line",
      });
    }
  });

  it("throws parser.parse_failed for empty keys", () => {
    const parser = new ListToEntriesParser();
    try {
      parser.parse(": Greg");
      fail("Expected an error to be thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(LlmExeError);
      expect((e as LlmExeError).context).toMatchObject({
        operation: "ListToEntriesParser.parse",
        parser: "listToEntries",
        reason: "empty_key",
      });
    }
  });

  it("throws for invalid input type", () => {
    const parser = new ListToEntriesParser();
    expect(() => {
      // @ts-expect-error runtime contract: parser rejects object input.
      parser.parse({});
    }).toThrow(LlmExeError);
  });

  describe("keyTransform option", () => {
    it("defaults to preserve", () => {
      const parser = new ListToEntriesParser();
      expect(parser.parse("First Name: Greg")).toEqual([["First Name", "Greg"]]);
    });

    it("camelCases keys when keyTransform is camelCase", () => {
      const parser = new ListToEntriesParser({ keyTransform: "camelCase" });
      expect(parser.parse("First Name: Greg\nLast Name: R")).toEqual([
        ["firstName", "Greg"],
        ["lastName", "R"],
      ]);
    });
  });
});
