import { generateToolCallId } from "./generateToolCallId";

describe("generateToolCallId", () => {
  it("generates OpenAI format tool call IDs", () => {
    const id = generateToolCallId("openai");
    expect(id).toMatch(/^call_[a-f0-9]{24}$/);
  });

  it("generates OpenAI format for openai-compatible providers", () => {
    const id = generateToolCallId("openai-compatible");
    expect(id).toMatch(/^call_[a-f0-9]{24}$/);
  });

  it("generates Anthropic format tool call IDs", () => {
    const id = generateToolCallId("anthropic");
    expect(id).toMatch(/^toolu_[a-f0-9]{23}$/);
  });

  it("generates Google/Gemini format tool call IDs", () => {
    const id = generateToolCallId("google");
    expect(id).toMatch(/^gem_[a-f0-9]{25}$/);
  });

  it("generates fallback format for unknown providers", () => {
    const id = generateToolCallId("unknown-provider");
    expect(id).toMatch(/^[a-f0-9]{32}$/);
  });

  it("generates unique IDs each time", () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateToolCallId("openai"));
    }
    expect(ids.size).toBe(100);
  });
});