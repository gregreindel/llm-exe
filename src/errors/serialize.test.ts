import { serializeLlmExeError } from "./serialize";
import { LlmExeError } from "./LlmExeError";

describe("serializeLlmExeError", () => {
  it("returns null for null/undefined", () => {
    expect(serializeLlmExeError(null)).toBeNull();
    expect(serializeLlmExeError(undefined)).toBeNull();
  });

  it("serializes a primitive", () => {
    expect(serializeLlmExeError("just text")).toBe("just text");
    expect(serializeLlmExeError(42)).toBe(42);
    expect(serializeLlmExeError(true)).toBe(true);
  });

  it("serializes an LlmExeError with standard fields", () => {
    const err = new LlmExeError("the message", {
      code: "parser.invalid_type",
      context: { parser: "json" },
    });
    expect(serializeLlmExeError(err)).toEqual({
      name: "LlmExeError",
      message: "the message",
      category: "parser",
      code: "parser.invalid_type",
      context: { parser: "json" },
    });
  });

  it("includes cause chain", () => {
    const root = new Error("root cause");
    const wrapped = new LlmExeError("wrap", {
      code: "parser.invalid_type",
      cause: root,
    });
    const json = serializeLlmExeError(wrapped) as Record<string, unknown>;
    expect(json.cause).toEqual({
      name: "Error",
      message: "root cause",
    });
  });

  it("truncates cause chain past max depth", () => {
    const a = new Error("a");
    const b = new Error("b");
    const c = new Error("c");
    const d = new Error("d");
    const e = new Error("e");
    const f = new Error("f");
    (a as { cause?: unknown }).cause = b;
    (b as { cause?: unknown }).cause = c;
    (c as { cause?: unknown }).cause = d;
    (d as { cause?: unknown }).cause = e;
    (e as { cause?: unknown }).cause = f;

    const json = serializeLlmExeError(a) as Record<string, unknown>;
    expect(JSON.stringify(json)).toContain("truncated");
  });

  it("handles circular cause without throwing", () => {
    const a: { name: string; message: string; cause?: unknown } = {
      name: "A",
      message: "a",
    };
    a.cause = a;
    expect(() => serializeLlmExeError(a)).not.toThrow();
    const json = JSON.stringify(serializeLlmExeError(a));
    expect(json).toContain("[Circular]");
  });

  it("handles circular context without throwing", () => {
    const ctx: { parser: string; back?: unknown } = { parser: "json" };
    ctx.back = ctx;
    const err = new LlmExeError("x", {
      code: "parser.invalid_type",
      context: ctx as any,
    });
    const json = JSON.stringify(serializeLlmExeError(err));
    expect(json).toContain("[Circular]");
  });

  it("summarizes Buffer", () => {
    const buf = Buffer.from("hello");
    const out = serializeLlmExeError({
      name: "X",
      message: "x",
      cause: buf,
    });
    const json = JSON.stringify(out);
    expect(json).toContain("[Buffer length=5]");
  });

  it("summarizes Map and Set", () => {
    const set = new Set([1, 2]);
    const map = new Map([["a", 1]]);
    const out = serializeLlmExeError({
      name: "X",
      message: "x",
      cause: { set, map },
    }) as Record<string, unknown>;
    expect(JSON.stringify(out)).toContain("[object Set]");
    expect(JSON.stringify(out)).toContain("[object Map]");
  });

  it("summarizes function and symbol", () => {
    const fn = function named() {};
    const sym = Symbol("hello");
    const out = serializeLlmExeError({
      name: "X",
      message: "x",
      cause: { fn, sym },
    });
    expect(JSON.stringify(out)).toContain("[Function named]");
    expect(JSON.stringify(out)).toContain("Symbol(hello)");
  });

  it("serializes Date as ISO string", () => {
    const d = new Date("2024-01-01T00:00:00.000Z");
    const out = serializeLlmExeError({
      name: "X",
      message: "x",
      cause: { when: d },
    }) as Record<string, unknown>;
    expect(JSON.stringify(out)).toContain("2024-01-01T00:00:00.000Z");
  });

  it("serializes bigint as string", () => {
    const out = serializeLlmExeError({
      name: "X",
      message: "x",
      cause: { big: 12345678901234567890n },
    });
    expect(JSON.stringify(out)).toContain("12345678901234567890");
  });

  it("includes stack when includeStack is true", () => {
    const err = new LlmExeError("x", { code: "parser.invalid_type" });
    const withStack = serializeLlmExeError(err, {
      includeStack: true,
    }) as Record<string, unknown>;
    expect(typeof withStack.stack).toBe("string");
  });

  it("excludes stack by default", () => {
    const err = new LlmExeError("x", { code: "parser.invalid_type" });
    const noStack = serializeLlmExeError(err) as Record<string, unknown>;
    expect(noStack.stack).toBeUndefined();
  });

  it("serializes Response objects compactly", () => {
    const resp = new Response("body", { status: 429, statusText: "Too Many" });
    const out = serializeLlmExeError({
      name: "X",
      message: "wrap",
      cause: resp,
    }) as Record<string, unknown>;
    expect(out.cause).toEqual({
      name: "Response",
      status: 429,
      statusText: "Too Many",
      url: "",
    });
  });

  it("caps deep object traversal", () => {
    let obj: any = { leaf: "v" };
    for (let i = 0; i < 10; i++) {
      obj = { nested: obj };
    }
    const out = serializeLlmExeError({
      name: "X",
      message: "x",
      cause: obj,
    });
    expect(() => JSON.stringify(out)).not.toThrow();
  });
});
