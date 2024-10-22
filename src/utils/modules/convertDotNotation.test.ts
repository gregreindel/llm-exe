import { convertDotNotation } from "@/utils/modules/convertDotNotation";

describe("convertDotNotation", () => {
  it("should convert single-level dot notation to nested objects", () => {
    const input = { "a.b": 1, "c.d.e": 2 };
    const expectedOutput = { a: { b: 1 }, c: { d: { e: 2 } } };
    expect(convertDotNotation(input)).toEqual(expectedOutput);
  });

  it("should handle multiple keys with different nesting levels", () => {
    const input = { "a.b.c": 1, "a.d": 2, "e.f.g.h": 3 };
    const expectedOutput = {
      a: {
        b: { c: 1 },
        d: 2,
      },
      e: {
        f: {
          g: {
            h: 3,
          },
        },
      },
    };
    expect(convertDotNotation(input)).toEqual(expectedOutput);
  });

  it("should handle keys without dots correctly", () => {
    const input = { a: 1, "b.c": 2, d: 3 };
    const expectedOutput = { a: 1, b: { c: 2 }, d: 3 };
    expect(convertDotNotation(input)).toEqual(expectedOutput);
  });

  it("should handle empty object correctly", () => {
    const input = {};
    const expectedOutput = {};
    expect(convertDotNotation(input)).toEqual(expectedOutput);
  });

  it("should handle nested objects as values correctly", () => {
    const input = { "a.b": { x: 1, y: 2 }, "c.d.e": { z: 3 } };
    const expectedOutput = { a: { b: { x: 1, y: 2 } }, c: { d: { e: { z: 3 } } } };
    expect(convertDotNotation(input)).toEqual(expectedOutput);
  });

  it("should handle keys with multiple dots correctly", () => {
    const input = { "a.b.c.d": 1, "a.b.c.e": 2, "a.f": 3 };
    const expectedOutput = {
      a: {
        b: {
          c: {
            d: 1,
            e: 2,
          },
        },
        f: 3,
      },
    };
    expect(convertDotNotation(input)).toEqual(expectedOutput);
  });
});