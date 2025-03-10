import { combineJsonl } from "./combineJsonl";
import { CombinedJsonLResult } from "@/interfaces";

describe("combineJsonl", () => {
  it("correctly combines, sorts, decodes content, and selects the final line", () => {
    const jsonl = `
      {"created_at":"2023-01-02T10:00:00Z","done":false,"message":{"role":"assistant","content":"Hello "}}
      {"created_at":"2023-01-01T09:00:00Z","done":false,"message":{"role":"assistant","content":"\\u003cWorld\\u003e"}}
      {"created_at":"2023-01-03T11:00:00Z","done":true,"model":"gpt-4","done_reason":"completed","message":{"role":"assistant","content":" final"},"total_duration":5000}
    `;

    const result: CombinedJsonLResult = combineJsonl(jsonl);

    expect(result.lines).toHaveLength(3);
    expect(result.lines[0].created_at).toBe("2023-01-01T09:00:00Z");
    expect(result.lines[1].created_at).toBe("2023-01-02T10:00:00Z");
    expect(result.lines[2].created_at).toBe("2023-01-03T11:00:00Z");

    expect(result.result.message.content).toBe("<World>Hello  final");
    expect(result.content.text).toBe("<World>Hello  final");
    expect(result.result.model).toBe("gpt-4");
    expect(result.result.done_reason).toBe("completed");
    expect(result.result.total_duration).toBe(5000);
  });

  it("throws if no done=true line found", () => {
    const jsonl = `
      {"created_at":"2023-01-01T09:00:00Z","done":false,"message":{"content":"First line"}}
      {"created_at":"2023-01-02T10:00:00Z","done":false,"message":{"content":"Second line"}}
    `;

    expect(() => combineJsonl(jsonl)).toThrow("No line found where done = true.");
  });

  it("defaults message role to 'assistant' if missing", () => {
    const jsonl = `
      {"created_at":"2023-01-01T09:00:00Z","done":false,"message":{"role":"assistant","content":"Hello "}}
      {"created_at":"2023-01-02T10:00:00Z","done":true,"model":"gpt-3.5","message":{"content":"World"}}
    `;

    const result = combineJsonl(jsonl);
    expect(result.result.message.role).toBe("assistant");
    expect(result.result.message.content).toBe("Hello World");
  });

  it("ignores blank lines, whitespace and still works", () => {
    const jsonl = `
    
      {"created_at":"2023-01-01T09:00:00Z","done":false,"message":{"content":"Line1 "}}
      
      {"created_at":"2023-01-02T09:00:00Z","done":true,"message":{"content":"Line2"}}
    
    `;

    const result = combineJsonl(jsonl);
    expect(result.lines).toHaveLength(2);
    expect(result.result.message.content).toBe("Line1 Line2");
  });

  it("throws on invalid JSON", () => {
    const jsonl = `
      {"created_at":"2023-01-01","done":false,"message":{"content":"Ok"}}
      { NOT VALID JSON }
      {"created_at":"2023-01-02","done":true,"message":{"content":"Done"}}
    `;

    expect(() => combineJsonl(jsonl)).toThrow("Invalid JSON");
  });

  it("throws for empty input or whitespace-only input", () => {
    expect(() => combineJsonl("")).toThrow("No JSON lines provided.");
    expect(() => combineJsonl("\n  \n")).toThrow("No JSON lines provided.");
  });

  it("uses first done line if multiple done=true lines", () => {
    const jsonl = `
      {"created_at":"2023-01-01T09:00:00Z","done":true,"model":"first-done","message":{"content":"First "}}
      {"created_at":"2023-01-02T10:00:00Z","done":true,"model":"second-done","message":{"content":"Second"}}
    `;
    const result = combineJsonl(jsonl);
    expect(result.result.model).toBe("first-done");
    expect(result.result.message.content).toBe("First Second");
  });
});
